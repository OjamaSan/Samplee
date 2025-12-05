// app/(tabs)/game-end.tsx

import React from 'react';
import { useRouter } from 'expo-router';
import GameEndScreen from '@/src/screens/GameEndScreen';
import { resetAllResults } from '@/src/data/roundResultsStore';

const GameEndScreenAny = GameEndScreen as any;

export default function GameEndRoute() {
  const router = useRouter();

  return (
    <GameEndScreenAny
      onBackToMenu={() => {
        // on reset les scores de la partie
        resetAllResults();
        // retour au menu principal (Home)
        router.push('/');
      }}
    />
  );
}
