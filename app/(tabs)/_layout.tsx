// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="player-setup"
        options={{ title: 'Players' }}
      />
      <Tabs.Screen
        name="player-edit"
        options={{ href: null }} // pas dans la barre de tab
      />
    </Tabs>
  );
}
