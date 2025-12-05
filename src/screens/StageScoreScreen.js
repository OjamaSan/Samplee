// src/screens/StageScoreScreen.js

import { Button } from '@/src/components/Button';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { usePlayers } from '@/src/context/PlayersContext';
import { AVATARS } from '@/src/data/avatars';
import { QUESTIONS_BY_STAGE } from '@/src/data/questions';
import { getStageResults } from '@/src/data/roundResultsStore';
import { STAGES } from '@/src/data/stages';
import { computeScoreForPlayer } from '@/src/lib/checkAnswer';
import { getStageTheme } from '@/src/theme/stageTheme';
import { theme } from '@/src/theme/theme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// ------- utils avatar -------

function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

/**
 * Props :
 *  - stageId
 *  - onNextStage()
 *  - onEndGame()
 */
export function StageScoreScreen({ stageId, onNextStage, onEndGame }) {
  const { players } = usePlayers();

  const stage = STAGES.find((s) => s.id === stageId);
  const stageLabel = stage
    ? `${stage.title} (${stage.periodLabel})`
    : stageId;

  const stageTheme = getStageTheme(stageId);
  const tone = stageTheme.family;

  // Recalcul à chaque rendu
  const questions = QUESTIONS_BY_STAGE[stageId] || [];
  const stageResults = getStageResults(stageId);

  const scores = {};
  players.forEach((p) => {
    scores[p.id] = 0;
  });

  questions.forEach((q) => {
    const res = stageResults?.[q.id];
    if (!res) return;
    players.forEach((p) => {
      const ans = res.answersByPlayer?.[p.id];
      const score = computeScoreForPlayer(ans, q.correctAnswer);
      scores[p.id] += score;
    });
  });

  const orderedPlayers = [...players].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
  );

  const winner = orderedPlayers[0] || null;

  const orderedPlayersWithTotal = orderedPlayers.map((p) => ({
    ...p,
    total: scores[p.id] ?? 0,
  }));

  if (!stage) {
    return (
      <ScreenContainer
        style={[
          styles.container,
          { backgroundColor: stageTheme.background },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: stageTheme.primaryText },
          ]}
        >
          Unknown stage: {stageId}
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      style={[
        styles.container,
        { backgroundColor: stageTheme.background },
      ]}
    >
      {/* Titre : "Player X wins this stage" */}
      {winner ? (
        <Text
          style={[
            theme.typography.headingSm,
            styles.title,
            { color: stageTheme.primaryText },
          ]}
        >
          {winner.name} wins this stage
        </Text>
      ) : (
        <Text
          style={[
            theme.typography.headingSm,
            styles.title,
            { color: stageTheme.primaryText },
          ]}
        >
          {stageLabel}
        </Text>
      )}

      {/* Carte scores */}
      <View
        style={[
          styles.card,
          { backgroundColor: stageTheme.cardBackground },
        ]}
      >
        {orderedPlayersWithTotal.map((player, index) => {
          const avatarSource = getAvatarSource(player.avatarId);
          return (
            <View key={player.id}>
              <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  {avatarSource ? (
                    <Image source={avatarSource} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  <Text
                    style={[
                      styles.playerName,
                      { color: stageTheme.cardText },
                    ]}
                  >
                    {player.name}
                  </Text>
                </View>

                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: stageTheme.palette[700] },
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreText,
                      { color: stageTheme.cardBackground },
                    ]}
                  >
                    {player.total}
                  </Text>
                </View>
              </View>

              {index < orderedPlayersWithTotal.length - 1 && (
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

      {/* Boutons bas de page */}
      <View style={styles.footer}>
        <View style={styles.footerButtonWrapper}>
          <Button
            variant="light"
            tone={tone}
            size="sm"
            title="Next stage"
            onPress={onNextStage}
          />
        </View>
        <View style={styles.footerButtonWrapper}>
          <Button
            variant="solid"
            tone="rouge"
            size="sm"
            title="End game"
            onPress={onEndGame}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

export default StageScoreScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[200],
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  playerName: {
    ...theme.typography.bodyMd,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...theme.typography.bodyMd,
  },
  separator: {
    height: 2,
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  footerButtonWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
});
