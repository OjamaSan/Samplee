// app/(tabs)/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

// Simple pile d'écrans : ni en-tête ni barre d'onglets, la navigation
// se fait par les boutons des écrans eux-mêmes.
export default function TabsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
