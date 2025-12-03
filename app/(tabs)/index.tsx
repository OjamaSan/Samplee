// app/(tabs)/index.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { HomeScreen } from '../../src/screens/HomeScreen';

export default function HomeRoute() {
  const handleNewGame = () => {
    // On remplace Home par PlayerSetup dans la stack
    router.replace('/(tabs)/player-setup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeScreen onNewGame={handleNewGame} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
