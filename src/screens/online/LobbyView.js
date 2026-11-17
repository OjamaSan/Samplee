// src/screens/online/LobbyView.js
//
// Salle d'attente : code de la partie, lien à partager, joueurs qui
// arrivent en direct. Seul l'hôte peut lancer la partie.

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/Button';
import { OnlinePlayerRow } from '../../components/OnlinePlayerRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import { kickPlayer, MAX_PLAYERS, MIN_PLAYERS } from '../../online/roomApi';
import { getRoomLink, shareRoom } from '../../online/share';
import { theme } from '../../theme/theme';

export function LobbyView({ code, uid, isHost, players, onStart, onLeave }) {
  const [shareFeedback, setShareFeedback] = useState('');

  const connectedCount = players.filter((p) => p.isConnected).length;
  const canStart = players.length >= MIN_PLAYERS;
  const link = getRoomLink(code);

  const handleShare = async () => {
    const result = await shareRoom(code);
    if (result === 'copied') setShareFeedback('Link copied!');
    else if (result === 'failed') setShareFeedback('Could not share the link.');
    else setShareFeedback('');
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.leaveButtonWrapper}>
            <Button
              variant="light"
              tone="rouge"
              size="sm"
              title="Leave"
              onPress={onLeave}
            />
          </View>
        </View>

        {/* Code de la partie */}
        <Text style={[theme.typography.headingSm, styles.codeLabel]}>
          Game code
        </Text>
        <Text style={styles.code}>{code}</Text>
        {link && <Text style={styles.linkText}>{link}</Text>}

        <View style={styles.shareButtonWrapper}>
          <Button
            variant="light"
            tone="rouge"
            size="sm"
            title="Share link"
            onPress={handleShare}
          />
        </View>
        {!!shareFeedback && (
          <Text style={styles.feedbackText}>{shareFeedback}</Text>
        )}

        {/* Joueurs */}
        <View style={styles.card}>
          <Text style={[theme.typography.bodyMd, styles.cardTitle]}>
            Players {players.length}/{MAX_PLAYERS}
          </Text>

          {players.map((player, index) => (
            <View key={player.id}>
              <OnlinePlayerRow
                player={player}
                isMe={player.id === uid}
                right={
                  isHost && player.id !== uid ? (
                    <TouchableOpacity
                      onPress={() => kickPlayer(code, player.id)}
                      style={styles.kickButton}
                      accessibilityLabel={`Remove ${player.name}`}
                    >
                      <Text style={styles.kickText}>✕</Text>
                    </TouchableOpacity>
                  ) : null
                }
              />
              {index < players.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        {/* Lancement */}
        <View style={styles.footer}>
          {isHost ? (
            <>
              <Button
                title="Start game"
                variant="solid"
                tone="green"
                size="lg"
                onPress={onStart}
                disabled={!canStart}
              />
              {!canStart && (
                <Text style={styles.hintText}>
                  Waiting for at least {MIN_PLAYERS} players…
                </Text>
              )}
              {canStart && connectedCount < players.length && (
                <Text style={styles.hintText}>
                  Some players are offline.
                </Text>
              )}
            </>
          ) : (
            <Text style={[theme.typography.headingSm, styles.waitingText]}>
              Waiting for the host to start the game…
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export default LobbyView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.rouge[500],
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerRow: {
    marginBottom: 8,
  },
  leaveButtonWrapper: {
    width: 120,
    alignSelf: 'flex-start',
  },
  codeLabel: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
  },
  code: {
    ...theme.typography.headingLg,
    fontSize: 64,
    lineHeight: 76,
    letterSpacing: 12,
    color: theme.colors.rouge[100],
    textAlign: 'center',
  },
  linkText: {
    ...theme.typography.bodySmCondensed,
    color: theme.colors.rouge[200],
    textAlign: 'center',
    marginBottom: 12,
  },
  shareButtonWrapper: {
    width: 180,
    alignSelf: 'center',
  },
  feedbackText: {
    ...theme.typography.bodySmCondensed,
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.rouge[100],
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  cardTitle: {
    color: theme.colors.rouge[700],
    marginBottom: 12,
  },
  separator: {
    height: 2,
    backgroundColor: theme.colors.rouge[300],
    marginVertical: 12,
  },
  kickButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.rouge[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  kickText: {
    color: theme.colors.rouge[100],
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
  },
  hintText: {
    ...theme.typography.bodySmCondensed,
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginTop: 8,
  },
  waitingText: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
  },
});
