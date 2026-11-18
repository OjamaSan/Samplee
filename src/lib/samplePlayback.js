// src/lib/samplePlayback.js
//
// Outils communs à la lecture des extraits (questions et corrections,
// en local comme en ligne).

import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Lecteur d'un extrait : lecture toujours depuis le début, arrêt,
 * et arrêt automatique quand l'écran disparaît.
 * source null → aucun son chargé (ex. joueur en ligne qui n'est pas l'hôte).
 */
export function useSamplePlayer(source) {
  const audio = useAudioPlayer(source ?? null);
  const status = useAudioPlayerStatus(audio);

  const play = useCallback(() => {
    if (!status.isLoaded) return false;
    audio.seekTo(0);
    audio.play();
    return true;
  }, [audio, status.isLoaded]);

  const stop = useCallback(() => {
    try {
      audio.pause();
    } catch {
      // lecteur déjà libéré
    }
  }, [audio]);

  // Sécurité : rien ne continue de jouer après avoir quitté l'écran
  useEffect(() => () => stop(), [stop]);

  const duration = Number.isFinite(status.duration) ? status.duration : 0;

  return {
    status,
    isPlaying: !!status.playing,
    duration,
    play,
    stop,
  };
}

/**
 * Valeur animée de 0 à 1 qui avance au rythme de la lecture.
 *  - playing : la lecture est en cours
 *  - duration : durée totale (secondes)
 *  - elapsed : secondes déjà jouées au moment où la lecture est détectée
 *  - syncKey : change quand une nouvelle lecture commence (resynchronise)
 * Hors lecture, la valeur revient à 0.
 */
export function usePlaybackProgress({ playing, duration, elapsed = 0, syncKey = null }) {
  const value = useRef(new Animated.Value(0)).current;
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  useEffect(() => {
    value.stopAnimation();
    if (!playing || !(duration > 0)) {
      value.setValue(0);
      return undefined;
    }

    const start = Math.min(Math.max(elapsedRef.current, 0), duration);
    value.setValue(start / duration);

    const animation = Animated.timing(value, {
      toValue: 1,
      duration: (duration - start) * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [playing, duration, syncKey, value]);

  return value;
}
