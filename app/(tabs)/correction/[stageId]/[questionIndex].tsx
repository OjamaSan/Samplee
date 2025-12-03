// app/(tabs)/correction/[stageId]/[questionIndex].tsx

import React from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CorrectionQuestionScreen from '@/src/screens/CorrectionQuestionScreen';
import { QUESTIONS_BY_STAGE } from '@/src/data/questions';
import { getQuestionResults } from '@/src/data/roundResultsStore';

type StageId = keyof typeof QUESTIONS_BY_STAGE;

export default function CorrectionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    stageId?: string;
    questionIndex?: string;
  }>();

  const rawStageId = params.stageId;
  const rawQuestionIndex = params.questionIndex ?? '0';

  if (!rawStageId) {
    return <Text>Missing stageId</Text>;
  }

  const stageId = rawStageId as StageId;
  const questions = QUESTIONS_BY_STAGE[stageId];

  if (!questions) {
    return <Text>Unknown stage: {rawStageId}</Text>;
  }

  const index = Number(rawQuestionIndex);
  if (Number.isNaN(index) || index < 0 || index >= questions.length) {
    return (
      <Text>
        Unknown correction index {rawQuestionIndex} for stage {rawStageId}
      </Text>
    );
  }

  const question = questions[index];
  const stored = getQuestionResults(rawStageId, question.id);

  if (!stored) {
    return <Text>No answers found for this question.</Text>;
  }

  const answersByPlayer = stored.answersByPlayer;
  const isLast = index + 1 >= questions.length;

  const handleNext = () => {
    if (!isLast) {
      router.push({
        pathname: '/correction/[stageId]/[questionIndex]',
        params: {
          stageId: rawStageId,
          questionIndex: String(index + 1),
        },
      });
    } else {
      // dernière correction → écran des scores du stage
      router.push({
        pathname: '/stage-score/[stageId]',
        params: { stageId: rawStageId },
      });
    }
  };

  return (
    <CorrectionQuestionScreen
      question={question}
      answersByPlayer={answersByPlayer}
      onNext={handleNext}
    />
  );
}
