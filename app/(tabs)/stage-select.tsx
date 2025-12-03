// app/(tabs)/stage-select.tsx

import { router } from 'expo-router';
import StageSelectScreen from '@/src/screens/StageSelectScreen';
import { QUESTIONS_BY_STAGE } from '@/src/data/questions';

// on cast le composant JS en any pour ne plus avoir de problème de props
const StageSelectScreenAny = StageSelectScreen as any;

const QUESTIONS_BY_STAGE_TYPED = QUESTIONS_BY_STAGE as Record<string, any[]>;

export default function StageSelectRoute() {
  return (
    <StageSelectScreenAny
      onBack={() => {
        router.push('/player-setup');
      }}
      isStagePlayable={(stageId: string) =>
        !!QUESTIONS_BY_STAGE_TYPED[stageId] &&
        QUESTIONS_BY_STAGE_TYPED[stageId].length > 0
      }
      onPlay={(stage: any) => {
        const questions = QUESTIONS_BY_STAGE_TYPED[stage.id];

        // Si pas de questions pour ce stage → on ne fait rien
        if (!questions || questions.length === 0) {
          return;
        }

        // Sinon on lance la première question (index 0) du stage courant
        router.push({
          pathname: '/round/[stageId]/[questionIndex]',
          params: {
            stageId: stage.id,   // ex: 'rnb_classics_1'
            questionIndex: '0',  // première question
          },
        });
      }}
    />
  );
}
