// src/online/localProfile.js
//
// Mémorise le dernier pseudo / avatar utilisé sur cet appareil, pour pré-remplir
// le formulaire à la partie suivante. Simple confort : si le stockage n'est
// pas disponible (navigation privée, app native), on repart d'un profil vide.

import { AVATARS } from '../data/avatars';

const KEY = 'samplee.onlineProfile';

function storage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function randomAvatarId() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]?.id ?? null;
}

export function loadProfile() {
  try {
    const raw = storage()?.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.name === 'string') {
      const avatarOk = AVATARS.some((a) => a.id === parsed.avatarId);
      return {
        name: parsed.name,
        avatarId: avatarOk ? parsed.avatarId : randomAvatarId(),
      };
    }
  } catch {
    // stockage illisible : on ignore
  }
  return { name: '', avatarId: randomAvatarId() };
}

export function saveProfile(profile) {
  try {
    storage()?.setItem(
      KEY,
      JSON.stringify({ name: profile.name, avatarId: profile.avatarId })
    );
  } catch {
    // stockage indisponible : pas grave
  }
}
