// src/screens/StageScoreScreen.js

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { usePlayers } from '../context/PlayersContext';
import { AVATARS } from '../data/avatars';
import { STAGES } from '../data/stages';
import { QUESTIONS_BY_STAGE } from '../data/questions';
import { getStageResults } from '../data/roundResultsStore';
import { getStageTheme } from '../theme/stageTheme';

// ------- utils avatar -------

function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

// ------- utils scoring (copié de Correction/GameEnd) -------

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/é|è|ê/g, 'e')
    .replace(/à/g, 'a')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function isCloseMatch(user, expected, maxRatio = 0.35) {
  const a = normalize(user);
  const b = normalize(expected);
  if (!a || !b) return false;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return dist <= Math.ceil(maxLen * maxRatio);
}


function isArtistCorrect(userArtist, correctArtist) {
  const normalized = normalize(correctArtist);

  // On découpe tous les artistes possibles :
  // "beyonce ft jay z" → ["beyonce", "jay z"]
  const parts = normalized
    .split(/\b(ft|ft\.|feat|feat\.|featuring|&|and)\b/g)
    .map((p) => p.trim())
    .filter(Boolean);

  // On ajoute aussi la chaîne complète comme candidat
  const candidates = [normalized, ...parts];

  // Si la réponse du joueur est proche de l’un des artistes → OK
  return candidates.some((candidate) =>
    isCloseMatch(userArtist, candidate)
  );
}


function isSongCorrect(userSong, correctSong) {
  return isCloseMatch(userSong, correctSong);
}

function computeScoreForPlayer(playerAnswer, correctAnswer) {
  if (!playerAnswer) return { score: 0 };
  const artistOk = isArtistCorrect(playerAnswer.artist, correctAnswer.artist);
  const songOk = isSongCorrect(playerAnswer.song, correctAnswer.song);
  return { score: (artistOk ? 1 : 0) + (songOk ? 1 : 0) };
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

  const { orderedPlayers, winner } = useMemo(() => {
    const questions = QUESTIONS_BY_STAGE[stageId] || [];
    const stageResults = getStageResults(stageId);

    // init scores
    const scores = {};
    players.forEach((p) => {
      scores[p.id] = 0;
    });

    // accumulate
    questions.forEach((q) => {
      const res = stageResults[q.id];
      if (!res) return;
      players.forEach((p) => {
        const ans = res.answersByPlayer?.[p.id];
        const { score } = computeScoreForPlayer(ans, q.correctAnswer);
        scores[p.id] += score;
      });
    });

    const ordered = [...players].sort(
      (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
    );

    const winnerPlayer = ordered[0] || null;

    return {
      orderedPlayers: ordered.map((p) => ({
        ...p,
        total: scores[p.id] ?? 0,
      })),
      winner: winnerPlayer,
    };
  }, [players, stageId]);

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
        {orderedPlayers.map((player, index) => {
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

              {index < orderedPlayers.length - 1 && (
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
