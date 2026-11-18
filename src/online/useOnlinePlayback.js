// src/online/useOnlinePlayback.js
//
// Lecture d'un extrait en mode en ligne. Le son ne sort que chez l'hôte ;
// il diffuse le début et la durée de la lecture, et chaque écran (hôte
// compris) affiche la même barre de progression.

import { useEffect, useRef, useState } from 'react';
import { usePlaybackProgress } from '../lib/samplePlayback';
import {
  getPlaybackFor,
  startPlayback,
  stopPlayback,
  useServerTimeOffset,
} from './roomApi';

/**
 * - player : retour de useSamplePlayer (utilisé seulement chez l'hôte)
 * - kind : 'sample' | 'correction'
 * Retourne { isPlaying, progress }.
 */
export function useOnlinePlayback({ code, room, isHost, kind, questionId, player }) {
  // ---- Hôte : diffuse le début et la fin de sa lecture ----
  const broadcastingRef = useRef(false);
  const hostPlaying = isHost && player.isPlaying;

  useEffect(() => {
    if (!isHost) return;
    if (hostPlaying && !broadcastingRef.current) {
      broadcastingRef.current = true;
      startPlayback(code, { kind, questionId, duration: player.duration }).catch(
        () => {}
      );
    } else if (!hostPlaying && broadcastingRef.current) {
      broadcastingRef.current = false;
      stopPlayback(code).catch(() => {});
    }
  }, [isHost, hostPlaying, code, kind, questionId, player.duration]);

  // ---- Autres joueurs : suivent la lecture diffusée ----
  const offset = useServerTimeOffset();
  const playback = isHost ? null : getPlaybackFor(room, kind, questionId);
  const startedAt = typeof playback?.startedAt === 'number' ? playback.startedAt : null;
  const remoteDuration = playback?.duration ?? 0;

  const elapsed = startedAt != null ? (Date.now() + offset - startedAt) / 1000 : 0;
  const [remoteEnded, setRemoteEnded] = useState(false);

  // Si l'hôte perd la connexion pendant la lecture, la barre
  // s'arrête d'elle-même une fois l'extrait terminé.
  useEffect(() => {
    setRemoteEnded(false);
    if (startedAt == null || !(remoteDuration > 0)) return undefined;
    const remainingMs = (remoteDuration - elapsed) * 1000;
    if (remainingMs <= 0) {
      setRemoteEnded(true);
      return undefined;
    }
    const timer = setTimeout(() => setRemoteEnded(true), remainingMs + 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, remoteDuration]);

  const remotePlaying = startedAt != null && remoteDuration > 0 && !remoteEnded;

  const isPlaying = isHost ? hostPlaying : remotePlaying;
  const progress = usePlaybackProgress({
    playing: isPlaying,
    duration: isHost ? player.duration : remoteDuration,
    elapsed: isHost ? 0 : elapsed,
    syncKey: isHost ? null : startedAt,
  });

  return { isPlaying, progress };
}
