// src/online/share.js

import { Platform, Share } from 'react-native';

/** Lien direct vers une partie (sur le web : même site que la page en cours). */
export function getRoomLink(code) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/room/${code}`;
  }
  return null;
}

/**
 * Partage le lien de la partie : feuille de partage native du téléphone
 * si elle existe, sinon copie dans le presse-papier.
 * Retourne 'shared' | 'copied' | 'failed'.
 */
export async function shareRoom(code) {
  const link = getRoomLink(code);
  const message = link
    ? `Join my Samplee game: ${link}`
    : `Join my Samplee game with code ${code}`;

  try {
    if (Platform.OS !== 'web') {
      await Share.share({ message });
      return 'shared';
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'Samplee', text: message, url: link });
      return 'shared';
    }

    await navigator.clipboard.writeText(link);
    return 'copied';
  } catch (err) {
    // L'utilisateur a fermé la feuille de partage : ce n'est pas une erreur
    if (err?.name === 'AbortError') return 'shared';

    try {
      await navigator.clipboard.writeText(link);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}
