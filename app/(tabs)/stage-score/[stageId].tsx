// app/(tabs)/stage-score/[stageId].tsx

import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StageScoreScreen from '@/src/screens/StageScoreScreen';

const StageScoreScreenAny = StageScoreScreen as any;

export default function StageScoreRoute() {
  const router = useRouter();
  const { stageId } = useLocalSearchParams<{ stageId?: string }>();

  if (!stageId) {
    return <Text>Missing stageId</Text>;
  }

  return (
    <StageScoreScreenAny
      stageId={stageId}
      onNextStage={() => {
        // Retour à la sélection de stage
        router.push('/stage-select');
      }}
      onEndGame={() => {
        // Aller à l'écran de fin de partie
        router.push('/game-end');
      }}
    />
  );
}
