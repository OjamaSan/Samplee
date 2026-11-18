// src/online/share.js

import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';

// Adresse du site en ligne (utilisée par l'app native, qui n'a pas d'URL)
const SITE_URL = 'https://samplee-a7aef.web.app';

/** Lien direct vers une partie (sur le web : même site que la page en cours). */
export function getRoomLink(code) {
  const origin =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : SITE_URL;
  return `${origin}/room/${code}`;
}

/** Copie le lien de la partie, seul (sans texte autour). */
export async function copyRoomLink(code) {
  try {
    await Clipboard.setStringAsync(getRoomLink(code));
    return true;
  } catch {
    return false;
  }
}

/**
 * Partage le lien de la partie via la feuille de partage du téléphone.
 * Seul le lien est partagé : "Copier" depuis la feuille donne un lien
 * qui fonctionne tel quel.
 * Retourne 'shared' | 'copied' (pas de feuille de partage) | 'failed'.
 */
export async function shareRoom(code) {
  const link = getRoomLink(code);

  try {
    if (Platform.OS !== 'web') {
      await Share.share(Platform.OS === 'ios' ? { url: link } : { message: link });
      return 'shared';
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'Samplee', url: link });
      return 'shared';
    }

    return (await copyRoomLink(code)) ? 'copied' : 'failed';
  } catch (err) {
    // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur
    if (err?.name === 'AbortError') return 'shared';
    return (await copyRoomLink(code)) ? 'copied' : 'failed';
  }
}
