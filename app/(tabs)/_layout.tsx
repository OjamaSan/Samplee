// app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { PlayersProvider } from '../../src/context/PlayersContext';

export default function TabsLayout() {
  return (
    <PlayersProvider>
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
    </PlayersProvider>
  );
}
