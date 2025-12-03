// src/screens/GameEndScreen.js

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { usePlayers } from '../context/PlayersContext';
import { AVATARS } from '../data/avatars';
import { QUESTIONS_BY_STAGE } from '../data/questions';
import { getAllResults } from '../data/roundResultsStore';

// avatar util
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

// --- scoring helpers (comme avant) ---
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

function computeScoreForPlayer(ans, correct) {
  if (!ans) return 0;
  const artistOk = isArtistCorrect(ans.artist, correct.artist);
  const songOk = isSongCorrect(ans.song, correct.song);
  return (artistOk ? 1 : 0) + (songOk ? 1 : 0);
}

/**
 * Props :
 *  - onBackToMenu()
 */
export function GameEndScreen({ onBackToMenu }) {
  const { players } = usePlayers();

  const { orderedPlayersWithRank, winnersForTitle, winnerForPodium } =
    useMemo(() => {
      const allResults = getAllResults(); // { [stageId]: { [questionId]: { answersByPlayer } } }

      const scores = {};
      players.forEach((p) => {
        scores[p.id] = 0;
      });

      Object.keys(allResults).forEach((stageId) => {
        const questions = QUESTIONS_BY_STAGE[stageId] || [];
        const stageResults = allResults[stageId];

        questions.forEach((q) => {
          const res = stageResults[q.id];
          if (!res) return;
          players.forEach((p) => {
            const ans = res.answersByPlayer?.[p.id];
            scores[p.id] += computeScoreForPlayer(ans, q.correctAnswer);
          });
        });
      });

      const ordered = [...players].sort(
        (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
      );

      // attribution des rangs avec égalités
      let lastScore = null;
      let lastRank = 0;
      const orderedWithRank = ordered.map((p, index) => {
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

      const maxScore = orderedWithRank[0]?.total ?? 0;
      const winners =
        maxScore > 0
          ? orderedWithRank.filter((p) => p.total === maxScore)
          : [];

      const podiumWinner = orderedWithRank[0] || null;

      return {
        orderedPlayersWithRank: orderedWithRank,
        winnersForTitle: winners,
        winnerForPodium: podiumWinner,
      };
    }, [players]);

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
  // positions un peu plus hautes pour éviter la superposition
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
