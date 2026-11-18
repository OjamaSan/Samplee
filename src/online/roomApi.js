// src/online/roomApi.js
//
// Tout ce qui lit / écrit une partie en ligne dans Firebase.
//
// Structure d'une partie : rooms/{CODE}
//   hostUid      : uid de l'hôte (seul autorisé à piloter la partie)
//   createdAt    : timestamp
//   phase        : 'lobby' | 'stageSelect' | 'question' | 'stageEnd' | ...
//   stageId, questionIndex, questionId : manche et question en cours
//   players/{uid}: { name, avatarId, joinedAt }  ← écrit par le joueur lui-même
//   presence/{uid}: true tant que le joueur est connecté (effacé
//                   automatiquement par Firebase à la déconnexion)
//   answers/{stageId}/{questionId}/{uid}: { artist, song, editing? }
//                   ← écrit par le joueur, uniquement pendant SA question.
//                   editing: true tant qu'il modifie sa réponse (elle ne
//                   compte alors pas comme donnée pour passer à la suite)
//   correctionIndex, revealed, correctionInfo : correction en cours
//                   (l'hôte les met à jour au fil de l'audio de correction,
//                   tous les écrans suivent)
//   playback       : { kind: 'sample' | 'correction', questionId, startedAt,
//                   duration } tant que l'hôte joue un extrait, pour que
//                   tous les écrans affichent la progression. Effacé à
//                   l'arrêt et à chaque changement d'étape.

import { useEffect, useState } from 'react';
import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { QUESTIONS_BY_STAGE } from '../data/questions';
import { computeScoreForPlayer } from '../lib/checkAnswer';
import { db, ensureSignedIn } from './firebase';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

// Pas de lettres ambiguës (O/0, I/1/L) pour que le code se lise à voix haute
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

function randomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** Nettoie un code tapé par un joueur ("k7 qf" → "K7QF"). */
export function normalizeCode(raw) {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH);
}

export function isValidCode(code) {
  return normalizeCode(code).length === CODE_LENGTH;
}

/**
 * Le pseudo est-il déjà pris par un autre joueur de la partie ?
 * (comparaison sans tenir compte des majuscules ni des espaces en trop)
 */
export function isNameTaken(players, name, ownUid = null) {
  const wanted = sanitizeName(name).toLowerCase();
  if (!wanted) return false;
  return Object.entries(players ?? {}).some(
    ([id, p]) => id !== ownUid && sanitizeName(p?.name).toLowerCase() === wanted
  );
}

/** Nettoie un pseudo (espaces, retours à la ligne, longueur). */
export function sanitizeName(raw) {
  return String(raw ?? '')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16);
}

const roomRef = (code) => ref(db, `rooms/${code}`);

/**
 * Crée une nouvelle partie et y inscrit l'hôte comme premier joueur.
 * Retourne le code de la partie.
 */
export async function createRoom(profile) {
  const uid = await ensureSignedIn();

  // On tire des codes jusqu'à en trouver un libre (collision très rare)
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const snapshot = await get(roomRef(code));
    if (snapshot.exists()) continue;

    await set(roomRef(code), {
      hostUid: uid,
      createdAt: serverTimestamp(),
      phase: 'lobby',
      players: {
        [uid]: {
          name: sanitizeName(profile.name),
          avatarId: profile.avatarId,
          joinedAt: serverTimestamp(),
        },
      },
    });

    return code;
  }

  throw new Error('Could not create a game, please try again.');
}

/**
 * Inscrit (ou met à jour) le joueur courant dans une partie existante.
 * Lève une erreur lisible si la partie n'existe pas, est pleine
 * ou a déjà commencé.
 */
export async function joinRoom(code, profile) {
  const uid = await ensureSignedIn();
  const snapshot = await get(roomRef(code));

  if (!snapshot.exists()) {
    throw new Error(`No game found with code ${code}.`);
  }

  const room = snapshot.val();
  const players = room.players ?? {};
  const alreadyIn = !!players[uid];

  if (!alreadyIn) {
    if (room.phase !== 'lobby') {
      throw new Error('This game has already started.');
    }
    if (Object.keys(players).length >= MAX_PLAYERS) {
      throw new Error('This game is full.');
    }
  }

  // Deux joueurs ne peuvent pas avoir le même pseudo (l'avatar, si)
  if (isNameTaken(players, profile.name, uid)) {
    throw new Error(
      `The name "${sanitizeName(profile.name)}" is already taken in this game. Please choose another one.`
    );
  }

  await set(ref(db, `rooms/${code}/players/${uid}`), {
    name: sanitizeName(profile.name),
    avatarId: profile.avatarId,
    joinedAt: alreadyIn ? players[uid].joinedAt : serverTimestamp(),
  });
}

/**
 * Le joueur courant quitte la partie.
 * En salle d'attente, il est retiré de la liste. Une fois la partie
 * commencée, il reste inscrit (ses points restent au classement) et
 * apparaît simplement hors ligne ; il peut revenir avec le même lien.
 */
export async function leaveRoom(code) {
  const uid = await ensureSignedIn();
  await remove(ref(db, `rooms/${code}/presence/${uid}`));

  const phase = (await get(ref(db, `rooms/${code}/phase`))).val();
  if (phase === 'lobby') {
    await remove(ref(db, `rooms/${code}/players/${uid}`));
  }
}

/** L'hôte retire un joueur de la salle d'attente. */
export async function kickPlayer(code, playerUid) {
  await update(roomRef(code), {
    [`players/${playerUid}`]: null,
    [`presence/${playerUid}`]: null,
  });
}

/** L'hôte fait passer la partie à l'étape suivante. */
export async function setPhase(code, phase, extra = {}) {
  await update(roomRef(code), { phase, playback: null, ...extra });
}

// ---------- Lecture des extraits (diffusée par l'hôte) ----------

/** L'hôte signale le début d'une lecture (durée en secondes). */
export async function startPlayback(code, { kind, questionId, duration }) {
  await set(ref(db, `rooms/${code}/playback`), {
    kind,
    questionId,
    duration,
    startedAt: serverTimestamp(),
  });
}

/** L'hôte signale la fin (ou l'arrêt) de la lecture. */
export async function stopPlayback(code) {
  await remove(ref(db, `rooms/${code}/playback`));
}

/** Lecture en cours pour cet extrait, ou null. */
export function getPlaybackFor(room, kind, questionId) {
  const playback = room?.playback;
  if (!playback || playback.kind !== kind || playback.questionId !== questionId) {
    return null;
  }
  return playback;
}

/**
 * Écart entre l'horloge de cet appareil et celle du serveur (ms),
 * pour calculer où en est la lecture lancée par l'hôte.
 */
export function useServerTimeOffset() {
  const [offset, setOffset] = useState(0);
  useEffect(
    () =>
      onValue(ref(db, '.info/serverTimeOffset'), (snapshot) => {
        setOffset(snapshot.val() ?? 0);
      }),
    []
  );
  return offset;
}

// ---------- Manches et questions ----------

export function getStageQuestions(stageId) {
  return QUESTIONS_BY_STAGE[stageId] ?? [];
}

/** Question en cours (données complètes : audio, cover, réponse…). */
export function getCurrentQuestion(room) {
  const questions = getStageQuestions(room?.stageId);
  return questions[room?.questionIndex ?? -1] ?? null;
}

/** Réponses déjà envoyées pour la question en cours : { [uid]: { artist, song } } */
export function getCurrentAnswers(room) {
  if (!room?.stageId || !room?.questionId) return {};
  return room.answers?.[room.stageId]?.[room.questionId] ?? {};
}

/** L'hôte lance une manche (si elle a déjà été jouée, on repart de zéro). */
export async function startStage(code, stageId) {
  const questions = getStageQuestions(stageId);
  if (!questions.length) return;

  await update(roomRef(code), {
    phase: 'question',
    stageId,
    questionIndex: 0,
    questionId: questions[0].id,
    [`answers/${stageId}`]: null,
    playback: null,
  });
}

/** L'hôte revient à la question précédente (les réponses sont conservées). */
export async function goToPreviousQuestion(code, room) {
  const questions = getStageQuestions(room.stageId);
  const prevIndex = (room.questionIndex ?? 0) - 1;
  if (prevIndex < 0 || !questions[prevIndex]) return;

  await update(roomRef(code), {
    questionIndex: prevIndex,
    questionId: questions[prevIndex].id,
    playback: null,
  });
}

/** L'hôte quitte une partie en cours : elle se termine pour tout le monde. */
export async function endGame(code) {
  await update(roomRef(code), { phase: 'closed', playback: null });
}

/** L'hôte passe à la question suivante, ou termine la manche. */
export async function goToNextQuestion(code, room) {
  const questions = getStageQuestions(room.stageId);
  const nextIndex = (room.questionIndex ?? 0) + 1;

  if (nextIndex < questions.length) {
    await update(roomRef(code), {
      questionIndex: nextIndex,
      questionId: questions[nextIndex].id,
      playback: null,
    });
  } else {
    await update(roomRef(code), { phase: 'stageEnd', playback: null });
  }
}

/**
 * Envoie (ou remplace) la réponse du joueur courant à la question en cours.
 * Une réponse vide (artist et song vides) = "I don't know".
 */
export async function submitAnswer(code, room, answer) {
  const uid = await ensureSignedIn();
  await set(
    ref(db, `rooms/${code}/answers/${room.stageId}/${room.questionId}/${uid}`),
    {
      artist: String(answer.artist ?? '').trim().slice(0, 100),
      song: String(answer.song ?? '').trim().slice(0, 100),
    }
  );
}

/**
 * Le joueur rouvre sa réponse pour la modifier : elle reste enregistrée
 * (elle compte si l'hôte passe quand même à la suite) mais n'est plus
 * considérée comme donnée tant qu'il ne l'a pas renvoyée.
 */
export async function startEditingAnswer(code, room, answer) {
  const uid = await ensureSignedIn();
  await set(
    ref(db, `rooms/${code}/answers/${room.stageId}/${room.questionId}/${uid}`),
    {
      artist: String(answer?.artist ?? ''),
      song: String(answer?.song ?? ''),
      editing: true,
    }
  );
}

/** Réponse donnée et validée (pas en cours de modification). */
export function isAnswerFinal(answer) {
  return !!answer && !answer.editing;
}

// ---------- Correction et scores ----------

/** Question en cours de correction. */
export function getCorrectionQuestion(room) {
  const questions = getStageQuestions(room?.stageId);
  return questions[room?.correctionIndex ?? -1] ?? null;
}

/** Réponses de tous les joueurs à une question donnée de la manche en cours. */
export function getAnswersFor(room, questionId) {
  return room?.answers?.[room?.stageId]?.[questionId] ?? {};
}

/**
 * Points par joueur : { [uid]: number }.
 * Sans stageId → total de toutes les manches jouées dans la partie.
 */
export function computeScores(room, players, stageId = null) {
  const scores = {};
  players.forEach((p) => {
    scores[p.id] = 0;
  });

  const answersByStage = room?.answers ?? {};
  const stageIds = stageId ? [stageId] : Object.keys(answersByStage);

  stageIds.forEach((sid) => {
    getStageQuestions(sid).forEach((question) => {
      const answers = answersByStage[sid]?.[question.id] ?? {};
      players.forEach((p) => {
        scores[p.id] += computeScoreForPlayer(answers[p.id], question);
      });
    });
  });

  return scores;
}

/** L'hôte lance la correction de la manche. */
export async function startCorrection(code) {
  await update(roomRef(code), {
    phase: 'correction',
    correctionIndex: 0,
    revealed: false,
    correctionInfo: '',
    playback: null,
  });
}

/** L'hôte passe à la correction suivante, ou aux scores de la manche. */
export async function goToNextCorrection(code, room) {
  const questions = getStageQuestions(room.stageId);
  const nextIndex = (room.correctionIndex ?? 0) + 1;

  if (nextIndex < questions.length) {
    await update(roomRef(code), {
      correctionIndex: nextIndex,
      revealed: false,
      correctionInfo: '',
      playback: null,
    });
  } else {
    await update(roomRef(code), { phase: 'stageScore', playback: null });
  }
}

/** L'hôte diffuse l'avancement de la correction (texte bpm/pitch, révélation). */
export async function updateCorrection(code, changes) {
  await update(roomRef(code), changes);
}

/** L'hôte relance une partie avec les mêmes joueurs (scores remis à zéro). */
export async function playAgain(code) {
  await update(roomRef(code), {
    phase: 'stageSelect',
    answers: null,
    stageId: null,
    questionIndex: null,
    questionId: null,
    correctionIndex: null,
    revealed: null,
    correctionInfo: null,
    playback: null,
  });
}

/**
 * Suit une partie en temps réel.
 * Retourne { uid, room, loading, error } :
 *  - room === null si la partie n'existe pas (ou plus)
 */
export function useRoom(code) {
  const [state, setState] = useState({
    uid: null,
    room: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!code) return undefined;

    let unsubscribe = () => {};
    let cancelled = false;

    ensureSignedIn()
      .then((uid) => {
        if (cancelled) return;
        unsubscribe = onValue(
          roomRef(code),
          (snapshot) => {
            setState({
              uid,
              room: snapshot.exists() ? snapshot.val() : null,
              loading: false,
              error: null,
            });
          },
          (error) => {
            setState((prev) => ({ ...prev, loading: false, error }));
          }
        );
      })
      .catch((error) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error }));
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [code]);

  return state;
}

/**
 * Signale que ce joueur est connecté tant que l'écran est ouvert.
 * Firebase efface automatiquement le marqueur si la connexion est perdue
 * (onglet fermé, téléphone verrouillé, réseau coupé), et on le remet
 * dès que la connexion revient.
 */
export function usePresence(code, uid, enabled) {
  useEffect(() => {
    if (!code || !uid || !enabled) return undefined;

    const presenceRef = ref(db, `rooms/${code}/presence/${uid}`);
    const connectedRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() !== true) return;
      onDisconnect(presenceRef)
        .remove()
        .then(() => set(presenceRef, true))
        .catch(() => {});
    });

    return () => {
      unsubscribe();
      onDisconnect(presenceRef).cancel().catch(() => {});
      remove(presenceRef).catch(() => {});
    };
  }, [code, uid, enabled]);
}

/**
 * Liste des joueurs triée par ordre d'arrivée, avec leur état de connexion.
 */
export function getPlayerList(room) {
  const players = room?.players ?? {};
  const presence = room?.presence ?? {};

  return Object.entries(players)
    .map(([id, p]) => ({
      id,
      name: p.name,
      avatarId: p.avatarId,
      joinedAt: typeof p.joinedAt === 'number' ? p.joinedAt : 0,
      isHost: id === room?.hostUid,
      isConnected: !!presence[id],
    }))
    .sort((a, b) => a.joinedAt - b.joinedAt);
}
