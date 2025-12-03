// app/(tabs)/player-edit.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerEditScreen } from '../../src/screens/PlayerEditScreen';

export default function PlayerEditRoute() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <PlayerEditScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
