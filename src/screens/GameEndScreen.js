// src/screens/GameEndScreen.js

import { QUESTIONS_BY_STAGE } from '@/src/data/questions';
import { getAllResults } from '@/src/data/roundResultsStore';
import {
  computeScoreForPlayer
} from '@/src/lib/checkAnswer';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { usePlayers } from '../context/PlayersContext';
import { AVATARS } from '../data/avatars';
import { theme } from '../theme/theme';
import { Podium } from '../components/Podium';
import {
  getPodiumSlots,
  getWinners,
  getWinnersTitle,
  rankPlayers,
} from '../lib/ranking';

const PODIUM_CARD_WIDTH = 320;
const PODIUM_WIDTH = PODIUM_CARD_WIDTH - 32;

// avatar util
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

/**
 * Props :
 *  - onBackToMenu()
 *  - onPlayAgain()? : bouton "Play again" (hôte en ligne)
 *  - players?, scores? : fournis par le mode en ligne ({ [playerId]: points }).
 *    Absents → joueurs et réponses de la partie locale.
 */
export function GameEndScreen({
  onBackToMenu,
  onPlayAgain,
  players: playersProp,
  scores: scoresProp,
}) {
  const { players: localPlayers } = usePlayers();
  const players = playersProp ?? localPlayers;
  const scores = scoresProp ?? computeLocalGameScores(players);

  // Classement avec égalités (1, 1, 2…) et podium correspondant
  const orderedPlayersWithRank = rankPlayers(players, scores);
  const podiumSlots = getPodiumSlots(orderedPlayersWithRank);
  const titleLabel =
    getWinnersTitle(getWinners(orderedPlayersWithRank), 'the game') ??
    'Game results';

  return (
    <ScreenContainer style={styles.container}>
      {/* Podium (gère les égalités) */}
      <View style={styles.podiumCard}>
        <Podium slots={podiumSlots} width={PODIUM_WIDTH} />
      </View>

      {/* Titre */}
      <Text style={[theme.typography.headingSm, styles.title]}>
        {titleLabel}
      </Text>

      {/* Liste joueurs */}
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
                <View
                  style={[
                    styles.playerRow,
                    player.isConnected === false && styles.offlineRow,
                  ]}
                >
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
                    <View style={styles.playerTexts}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {player.name}
                      </Text>
                      {player.isConnected === false && (
                        <Text style={styles.offlineText}>offline</Text>
                      )}
                    </View>
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
        {onPlayAgain && (
          <Button
            variant="solid"
            tone="green"
            size="lg"
            title="Play again"
            onPress={onPlayAgain}
            style={styles.playAgainButton}
          />
        )}
        <Button
          variant="light"
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

// Total de chaque joueur sur toutes les manches de la partie locale
function computeLocalGameScores(players) {
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
        scores[p.id] += computeScoreForPlayer(ans, q);
      });
    });
  });

  return scores;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.rouge[500],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  podiumCard: {
    backgroundColor: theme.colors.rouge[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    width: PODIUM_CARD_WIDTH,
    alignSelf: 'center',
  },
  title: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.rouge[100],
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
    color: theme.colors.rouge[700],
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
  playerTexts: {
    flex: 1,
  },
  playerName: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[700],
  },
  offlineRow: {
    opacity: 0.45,
  },
  offlineText: {
    ...theme.typography.bodySmCondensed,
    color: theme.colors.rouge[700],
    opacity: 0.8,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.rouge[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[100],
  },
  separator: {
    height: 2,
    backgroundColor: theme.colors.rouge[300],
    marginVertical: 8,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  playAgainButton: {
    marginBottom: 12,
  },
});
