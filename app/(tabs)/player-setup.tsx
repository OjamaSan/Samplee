// app/(tabs)/player-setup.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PlayerSetupScreen } from '../../src/screens/PlayerSetupScreen';

export default function PlayerSetupRoute() {
  const handleBack = () => {
    // On force le retour à la Home
    router.replace('/(tabs)');
  };

  const handlePlayersConfirmed = (playerNames: string[]) => {
    console.log('Players for this game:', playerNames);
    // TODO: navigation vers l'écran suivant
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PlayerSetupScreen
        onBack={handleBack}
        onConfirm={handlePlayersConfirmed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
