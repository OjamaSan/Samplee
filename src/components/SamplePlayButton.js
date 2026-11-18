// src/components/SamplePlayButton.js
//
// Bouton de lecture d'un extrait : pendant la lecture, il reste enfoncé,
// affiche "Now playing" et se remplit comme une barre de progression.
// Avec onStop, un bouton stop rouge est affiché à sa droite.

import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from './Button';

/**
 * Props :
 *  - label : texte au repos ("Play sample", "Reveal answer", "Waiting host"…)
 *  - playingLabel? : texte pendant la lecture (défaut "Now playing")
 *  - isPlaying : lecture en cours
 *  - progress : Animated.Value 0 → 1 (voir usePlaybackProgress)
 *  - onPlay? : absent → bouton désactivé (ex. joueur qui n'est pas l'hôte)
 *  - onStop? : affiche le bouton stop
 *  - tone : couleur du stage
 */
export function SamplePlayButton({
  label,
  playingLabel = 'Now playing',
  isPlaying,
  progress,
  onPlay,
  onStop,
  tone,
  style,
}) {
  return (
    <View style={[styles.row, style]}>
      <Button
        variant="light"
        tone={tone}
        size="sm"
        title={isPlaying ? playingLabel : label}
        active={isPlaying}
        progress={progress}
        disabled={!onPlay}
        // Pendant la lecture, seul le bouton stop l'interrompt
        onPress={isPlaying ? undefined : onPlay}
        style={styles.playButton}
      />
      {onStop && (
        <Button
          variant="solid"
          tone="rouge"
          size="sm"
          icon={<Ionicons name="stop" size={18} color={theme.colors.rouge[100]} />}
          disabled={!isPlaying}
          onPress={onStop}
          style={styles.stopButton}
        />
      )}
    </View>
  );
}

export default SamplePlayButton;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  playButton: {
    width: 200,
  },
  stopButton: {
    width: 44,
  },
});
