// app/_layout.tsx

import { PlayersProvider } from '@/src/context/PlayersContext';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Écrans de partie : pas de geste "retour" (on ne revient pas sur une
// question déjà jouée, ni sur une correction déjà vue).
const IN_GAME = { gestureEnabled: false };

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'CabinCondensed-Regular': require('../assets/fonts/CabinCondensed-Regular.ttf'),
  });

  useEffect(() => {
    // Sans ça, iOS coupe le son quand le téléphone est en mode silencieux.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <PlayersProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="round/[stageId]/[questionIndex]" options={IN_GAME} />
        <Stack.Screen name="stage-end/[stageId]" options={IN_GAME} />
        <Stack.Screen name="correction/[stageId]/[questionIndex]" options={IN_GAME} />
        <Stack.Screen name="stage-score/[stageId]" options={IN_GAME} />
        <Stack.Screen name="game-end" options={IN_GAME} />
        <Stack.Screen name="room/[code]" options={IN_GAME} />
      </Stack>
    </PlayersProvider>
  );
}
