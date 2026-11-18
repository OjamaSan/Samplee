// src/online/useKeepScreenOn.js
//
// Empêche l'écran de se mettre en veille pendant une partie en ligne
// (sinon le téléphone se verrouille, le joueur passe "offline" et, pour
// l'hôte, le son s'arrête). Utilise l'API "Screen Wake Lock" des
// navigateurs (Chrome, Safari 16.4+…) ; ne fait rien si elle n'existe pas.
//
// Le navigateur relâche le verrou dès que la page passe en arrière-plan :
// on le redemande quand elle redevient visible.

import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useKeepScreenOn(enabled) {
  useEffect(() => {
    if (!enabled || Platform.OS !== 'web') return undefined;
    if (typeof navigator === 'undefined' || !navigator.wakeLock) return undefined;

    let lock = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        // Refusé (batterie faible, onglet non actif…) : pas grave
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      lock?.release().catch(() => {});
    };
  }, [enabled]);
}
