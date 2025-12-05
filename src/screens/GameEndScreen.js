// src/screens/GameEndScreen.js

import { Button } from '@/src/components/Button';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { usePlayers } from '@/src/context/PlayersContext';
import { AVATARS } from '@/src/data/avatars';
import { QUESTIONS_BY_STAGE } from '@/src/data/questions';
import { getAllResults } from '@/src/data/roundResultsStore';
import { computeScoreForPlayer } from '@/src/lib/checkAnswer';
import { theme } from '@/src/theme/theme';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// avatar util
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

/**
 * Props :
 *  - onBackToMenu()
 */
export function GameEndScreen({ onBackToMenu }) {
  const { players } = usePlayers();

  const allResults = getAllResults(); // { [stageId]: { [questionId]: { answersByPlayer } } }

  const scores = {};
  players.forEach((p) => {
    scores[p.id] = 0;
  });

  Object.keys(allResults).forEach((stageId) => {
    const questions = QUESTIONS_BY_STAGE[stageId] || [];
    const stageResults = allResults[stageId];

    questions.forEach((q) => {
      const res = stageResults?.[q.id];
      if (!res) return;
      players.forEach((p) => {
        const ans = res.answersByPlayer?.[p.id];
        const score = computeScoreForPlayer(ans, q.correctAnswer);
        scores[p.id] += score;
      });
    });
  });

  const ordered = [...players].sort(
    (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
  );

  // attribution des rangs avec égalités
  let lastScore = null;
  let lastRank = 0;
  const orderedPlayersWithRank = ordered.map((p, index) => {
    const score = scores[p.id] ?? 0;
    let rank;
    if (lastScore === null) {
      rank = 1;
    } else if (score === lastScore) {
      rank = lastRank; // égalité
    } else {
      rank = index + 1;
    }
    lastScore = score;
    lastRank = rank;
    return { ...p, total: score, rank };
  });

  const maxScore = orderedPlayersWithRank[0]?.total ?? 0;
  const winnersForTitle =
    maxScore > 0
      ? orderedPlayersWithRank.filter((p) => p.total === maxScore)
      : [];

  const topThree = orderedPlayersWithRank.slice(0, 3);

  // phrase de titre avec gestion des égalités
  let titleLabel = 'Game results';
  if (winnersForTitle.length === 1) {
    titleLabel = `${winnersForTitle[0].name} wins the game !`;
  } else if (winnersForTitle.length === 2) {
    titleLabel = `${winnersForTitle[0].name} and ${winnersForTitle[1].name} win the game !`;
  } else if (winnersForTitle.length >= 3) {
    titleLabel = `${winnersForTitle[0].name}, ${winnersForTitle[1].name} and ${winnersForTitle[2].name} win the game !`;
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Card podium avec image + avatars/noms */}
      <View style={styles.podiumCard}>
        <View style={styles.podiumInner}>
          <Image
            source={require('../../assets/images/podium.png')}
            style={styles.podiumImage}
            resizeMode="contain"
          />

          {/* 2e place (à gauche) */}
          {topThree[1] && (
            <View style={[styles.podiumSlot, styles.podiumSlotSecond]}>
              <View style={styles.podiumAvatarWrapper}>
                {getAvatarSource(topThree[1].avatarId) ? (
                  <Image
                    source={getAvatarSource(topThree[1].avatarId)}
                    style={styles.podiumAvatar}
                  />
                ) : (
                  <View style={styles.podiumAvatarPlaceholder} />
                )}
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {topThree[1].name}
              </Text>
            </View>
          )}

          {/* 1re place (au centre) */}
          {topThree[0] && (
            <View style={[styles.podiumSlot, styles.podiumSlotFirst]}>
              <View style={styles.podiumAvatarWrapper}>
                {getAvatarSource(topThree[0].avatarId) ? (
                  <Image
                    source={getAvatarSource(topThree[0].avatarId)}
                    style={styles.podiumAvatar}
                  />
                ) : (
                  <View style={styles.podiumAvatarPlaceholder} />
                )}
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {topThree[0].name}
              </Text>
            </View>
          )}

          {/* 3e place (à droite) */}
          {topThree[2] && (
            <View style={[styles.podiumSlot, styles.podiumSlotThird]}>
              <View style={styles.podiumAvatarWrapper}>
                {getAvatarSource(topThree[2].avatarId) ? (
                  <Image
                    source={getAvatarSource(topThree[2].avatarId)}
                    style={styles.podiumAvatar}
                  />
                ) : (
                  <View style={styles.podiumAvatarPlaceholder} />
                )}
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {topThree[2].name}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Titre */}
      <Text style={[theme.typography.headingSm, styles.title]}>
        {titleLabel}
      </Text>

      {/* Liste joueurs (scrollable) */}
      <View style={styles.card}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {orderedPlayersWithRank.map((player, index) => {
            const avatarSource = getAvatarSource(player.avatarId);
            return (
              <View key={player.id}>
                <View style={styles.playerRow}>
                  <Text style={styles.rankText}>{player.rank}</Text>

                  <View style={styles.playerInfo}>
                    {avatarSource ? (
                      <Image
                        source={avatarSource}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder} />
                    )}
                    <Text style={styles.playerName}>{player.name}</Text>
                  </View>

                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{player.total}</Text>
                  </View>
                </View>

                {index < orderedPlayersWithRank.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Bouton retour menu */}
      <View style={styles.footer}>
        <Button
          variant="solid"
          tone="rouge"
          size="lg"
          title="Back to menu"
          onPress={onBackToMenu}
        />
      </View>
    </ScreenContainer>
  );
}

export default GameEndScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.turquoise[500],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  podiumCard: {
    backgroundColor: theme.colors.turquoise[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    width: 320,
    alignSelf: 'center',
  },
  podiumInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginTop: 104,
  },
  podiumSlot: {
    position: 'absolute',
    alignItems: 'center',
  },
  podiumSlotFirst: {
    top: 4,
    left: '54%',
    transform: [{ translateX: -40 }],
  },
  podiumSlotSecond: {
    top: 32,
    left: '20%',
    transform: [{ translateX: -40 }],
  },
  podiumSlotThird: {
    top: 48,
    left: '87%',
    transform: [{ translateX: -40 }],
  },
  podiumAvatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: theme.colors.gray[200],
  },
  podiumAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  podiumAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.gray[300],
  },
  podiumName: {
    ...theme.typography.bodySm,
    color: theme.colors.turquoise[700],
    maxWidth: 80,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.turquoise[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 260,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    ...theme.typography.bodyMd,
    color: theme.colors.turquoise[700],
    width: 24,
    textAlign: 'left',
    marginRight: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[200],
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  playerName: {
    ...theme.typography.bodyMd,
    color: theme.colors.turquoise[700],
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.turquoise[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...theme.typography.bodyMd,
    color: theme.colors.turquoise[100],
  },
  separator: {
    height: 2,
    backgroundColor: theme.colors.turquoise[300],
    marginVertical: 8,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
});
