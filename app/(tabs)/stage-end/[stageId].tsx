// app/(tabs)/stage-end/[stageId].tsx

import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StageEndScreen from '@/src/screens/StageEndScreen';

export default function StageEndRoute() {
  const router = useRouter();
  const { stageId } = useLocalSearchParams<{ stageId?: string }>();

  if (!stageId) {
    return <Text>Missing stageId</Text>;
  }

  return (
    <StageEndScreen
      stageId={stageId}
      onSeeAnswers={() => {
        router.push({
          pathname: '/correction/[stageId]/[questionIndex]',
          params: {
            stageId,
            questionIndex: '0', // correction de la première question
          },
        });
      }}
    />
  );
}
