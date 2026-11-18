// src/screens/online/OnlineCorrectionView.js
//
// Correction d'une question en mode en ligne. L'hôte joue l'audio de
// correction ; à mesure qu'il avance, il diffuse le texte (bpm / pitch…)
// et le moment de la révélation : tous les écrans se mettent à jour
// en même temps. Les points ne s'affichent qu'après la révélation.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { OnlinePlayerRow } from '../../components/OnlinePlayerRow';
import { SamplePlayButton } from '../../components/SamplePlayButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { getAnswerResult } from '../../lib/checkAnswer';
import { useSamplePlayer } from '../../lib/samplePlayback';
import {
  getAnswersFor,
  getStageQuestions,
  goToNextCorrection,
  updateCorrection,
} from '../../online/roomApi';
import { useOnlinePlayback } from '../../online/useOnlinePlayback';
import { getStageTheme } from '../../theme/stageTheme';
import { theme } from '../../theme/theme';

export function OnlineCorrectionView({ code, room, uid, isHost, players, question }) {
  const stageTheme = getStageTheme(question.stageId);
  const tone = stageTheme.family;

  const questions = getStageQuestions(room.stageId);
  const questionNumber = (room.correctionIndex ?? 0) + 1;
  const isLast = questionNumber >= questions.length;

  const isRevealed = !!room.revealed;
  const infoText = room.correctionInfo ?? '';

  const answers = getAnswersFor(room, question.id);
  const results = useMemo(() => {
    const byPlayer = {};
    players.forEach((p) => {
      byPlayer[p.id] = getAnswerResult(answers[p.id], question);
    });
    return byPlayer;
  }, [players, answers, question]);

  const title = isRevealed ? question.answerTitle : question.title;
  const coverSource = isRevealed ? question.answerCoverSource : question.coverSource;

  // ------- Audio de correction : joué chez l'hôte -------
  const correction = useSamplePlayer(isHost ? question.correctionAudioSource : null);
  const playback = useOnlinePlayback({
    code,
    room,
    isHost,
    kind: 'correction',
    questionId: question.id,
    player: correction,
  });
  useBroadcastCorrectionSteps({ code, room, question, status: correction.status, isHost });

  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const handlePlay = () => {
    // Pas d'audio de correction : on révèle directement
    if (!question.correctionAudioSource) {
      updateCorrection(code, { revealed: true }).catch(() => {});
      return;
    }
    if (correction.play()) setHasPlayedOnce(true);
  };

  const playLabel = !isHost
    ? 'Waiting host'
    : hasPlayedOnce
      ? 'Listen again'
      : 'Reveal answer';

  const [advancing, setAdvancing] = useState(false);
  const handleNext = async () => {
    setAdvancing(true);
    correction.stop();
    try {
      await goToNextCorrection(code, room);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <ScreenContainer
      scroll
      style={{ backgroundColor: stageTheme.background }}
      contentStyle={styles.scrollContent}
    >
        <Text style={[styles.progress, { color: stageTheme.primaryText }]}>
          Correction {questionNumber}/{questions.length}
        </Text>

        <Text
          style={[
            theme.typography.headingSm,
            styles.centerText,
            { color: stageTheme.primaryText },
          ]}
        >
          {title}
        </Text>

        <View style={styles.coverWrapper}>
          {coverSource && (
            <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
          )}
        </View>

        {/* Texte bpm / pitch diffusé par l'hôte */}
        <View style={styles.infoZone}>
          <Text style={[styles.infoText, { color: stageTheme.primaryText }]}>
            {infoText}
          </Text>
        </View>

        <SamplePlayButton
          tone={tone}
          label={playLabel}
          isPlaying={playback.isPlaying}
          progress={playback.progress}
          onPlay={isHost ? handlePlay : undefined}
          onStop={isHost ? correction.stop : undefined}
          style={styles.playButton}
        />

        {/* Joueurs : réponses et points (après révélation) */}
        <View style={[styles.card, { backgroundColor: stageTheme.cardBackground }]}>
          {players.map((player, index) => {
            const result = results[player.id];
            return (
              <View key={player.id}>
                <OnlinePlayerRow
                  player={player}
                  isMe={player.id === uid}
                  textColor={stageTheme.cardText}
                  right={
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: stageTheme.palette[700] },
                      ]}
                    >
                      <Text
                        style={[styles.scoreText, { color: stageTheme.cardBackground }]}
                      >
                        {isRevealed ? `+${result.score}` : '?'}
                      </Text>
                    </View>
                  }
                />
                {isRevealed && (
                  <Text style={[styles.answerText, { color: stageTheme.cardText }]}>
                    {formatAnswerWithResult(answers[player.id], result)}
                  </Text>
                )}
                {index < players.length - 1 && (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: stageTheme.palette[300] },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          {isHost ? (
            <Button
              variant="light"
              tone={tone}
              size="lg"
              title={isLast ? 'See scores' : 'Next question'}
              onPress={handleNext}
              disabled={advancing}
            />
          ) : (
            isRevealed && (
              <Text style={[styles.hintText, { color: stageTheme.primaryText }]}>
                Waiting for the host…
              </Text>
            )
          )}
        </View>
    </ScreenContainer>
  );
}

export default OnlineCorrectionView;

function formatAnswerWithResult(answer, result) {
  if (!answer) return 'No answer';
  if (!answer.artist && !answer.song) return "I don't know";
  const artist = `${answer.artist || '—'} ${result.artistOk ? '✅' : '❌'}`;
  const song = `${answer.song || '—'} ${result.songOk ? '✅' : '❌'}`;
  return `${artist}\n${song}`;
}

/**
 * Chez l'hôte, les étapes (bpm / pitch / reveal) suivent la position réelle
 * de l'audio de correction, comme en mode local, et sont diffusées aux
 * autres joueurs.
 */
function useBroadcastCorrectionSteps({ code, room, question, status, isHost }) {
  // On garde les dernières valeurs diffusées pour n'écrire dans Firebase
  // que lorsque quelque chose change (et pas à chaque tick de l'audio).
  const sentRef = useRef({
    info: room.correctionInfo ?? '',
    revealed: !!room.revealed,
  });

  const steps = question.correctionSteps;
  useEffect(() => {
    if (!isHost) return;
    if (!status.playing && !status.didJustFinish) return;

    const t = status.currentTime;
    const reached = (steps ?? []).filter((s) => s.at <= t);
    const lastText = [...reached].reverse().find((s) => s.text);
    const info = lastText?.text ?? '';
    const shouldReveal = reached.some((s) => s.reveal) || status.didJustFinish;

    const changes = {};
    if (info !== sentRef.current.info) {
      changes.correctionInfo = info;
      sentRef.current.info = info;
    }
    if (shouldReveal && !sentRef.current.revealed) {
      changes.revealed = true;
      sentRef.current.revealed = true;
    }
    if (Object.keys(changes).length) {
      updateCorrection(code, changes).catch(() => {});
    }
  }, [isHost, status.currentTime, status.playing, status.didJustFinish, steps, code]);
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  progress: {
    ...theme.typography.bodySmCondensed,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.85,
  },
  centerText: {
    textAlign: 'center',
  },
  coverWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  coverImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
  infoZone: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    ...theme.typography.bodyMd,
    textAlign: 'center',
  },
  playButton: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scoreText: {
    ...theme.typography.bodyMd,
  },
  answerText: {
    ...theme.typography.bodySmCondensed,
    marginTop: 6,
    marginLeft: 60,
  },
  separator: {
    height: 2,
    marginVertical: 12,
  },
  footer: {
    marginTop: 8,
  },
  hintText: {
    ...theme.typography.bodyMd,
    textAlign: 'center',
  },
});
