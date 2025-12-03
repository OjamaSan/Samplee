// src/screens/PlayerSetupScreen.js

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { usePlayers } from '../context/PlayersContext';
import { AVATARS } from '../data/avatars';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

// utilitaire : retrouver la source d'un avatar à partir de son id
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

// utilitaire : choisir un avatar pour un nouveau joueur
function pickAvatarForNewPlayer(existingPlayers) {
  if (!AVATARS.length) return null;

  const usedAvatarIds = new Set(
    existingPlayers
      .map((p) => p.avatarId)
      .filter(Boolean)
  );

  const availableAvatars = AVATARS.filter(
    (a) => !usedAvatarIds.has(a.id)
  );

  const pool =
    availableAvatars.length > 0 ? availableAvatars : AVATARS;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex]?.id ?? null;
}

export function PlayerSetupScreen({ onBack, onConfirm }) {
  const { players, setPlayers, nextPlayerIdRef } = usePlayers();

  const canAddPlayer = players.length < MAX_PLAYERS;
  const canRemovePlayer = players.length > MIN_PLAYERS;

  const isFormValid = useMemo(
    () => players.length >= MIN_PLAYERS,
    [players]
  );

  const handleAddPlayer = () => {
    if (!canAddPlayer) return;

    setPlayers((prev) => {
      const nextDisplayIndex = prev.length + 1;
      const newId = String(nextPlayerIdRef.current++);

      const avatarId = pickAvatarForNewPlayer(prev);

      return [
        ...prev,
        {
          id: newId,
          name: `Player ${nextDisplayIndex}`,
          avatarId,
        },
      ];
    });
  };

  const handleRemovePlayer = (id) => {
    if (!canRemovePlayer) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleEditPlayer = (id) => {
    router.push({
      pathname: '/(tabs)/player-edit',
      params: { playerId: id },
    });
  };

  const handleConfirm = () => {
    if (!isFormValid) return;
    router.push('/(tabs)/stage-select');
  };

  const renderPlayerItem = ({ item, index }) => {
    const avatarSource = getAvatarSource(item.avatarId);

    return (
      <View style={styles.playerRow}>
        <View style={styles.playerInfo}>
          {/* Avatar : image si dispo, sinon placeholder gris */}
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          <Text style={styles.playerName}>{item.name}</Text>
        </View>

        <View style={styles.playerActions}>
          {/* Bouton icône bleu (edit) */}
          <Button
            variant="solid"
            tone="blue"
            size="sm"
            onPress={() => handleEditPlayer(item.id)}
            style={styles.iconButton}
            icon={<Text style={styles.iconText}>✎</Text>}
          />

          {/* Bouton icône rouge (delete) – seulement à partir du 3e joueur */}
          {index >= 2 && (
            <Button
              variant="solid"
              tone="rouge"
              size="sm"
              onPress={() => handleRemovePlayer(item.id)}
              style={styles.iconButton}
              icon={<Text style={styles.iconText}>✕</Text>}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* 1. Back = petit bouton rouge light */}
      <View style={styles.headerRow}>
        <View style={styles.backButtonWrapper}>
          <Button
            variant="light"
            tone="rouge"
            size="sm"
            title="Back"
            onPress={onBack}
          />
        </View>
      </View>

      {/* 2. Titre Heading L */}
      <Text style={[theme.typography.headingLg, styles.title]}>
        Select the number of players/teams
      </Text>

      {/* 3. Bloc liste joueurs dans un card rouge 100 */}
      <View style={styles.card}>
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />

        {/* 5. Bouton Add player/team bleu solid, dans le bloc */}
        <View style={styles.addButtonRow}>
          <Button
            title="Add player/team"
            variant="solid"
            tone="blue"
            size="sm"
            onPress={handleAddPlayer}
            disabled={!canAddPlayer}
            style={styles.addPlayerButton}
          />
          <Text style={styles.counterText}>
            {players.length}/{MAX_PLAYERS}
          </Text>
        </View>
      </View>

      {/* 6. Gros bouton Start game vert solid */}
      <View style={styles.footer}>
        <Button
          title="Start game"
          variant="solid"
          tone="green"
          size="lg"
          onPress={handleConfirm}
          disabled={!isFormValid}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.rouge[500],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerRow: {
    marginBottom: 16,
  },
  backButtonWrapper: {
    width: 120,
    alignSelf: 'flex-start',
  },
  title: {
    color: theme.colors.rouge[100],
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.rouge[100],
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[200],
    marginRight: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  playerName: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[700],
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    marginLeft: 8,
  },
  iconText: {
    ...theme.typography.headingSm,
    color: theme.colors.rouge[100],
  },
  separator: {
    height: 2,
    backgroundColor: theme.colors.rouge[700],
    marginVertical: 12,
  },
  addButtonRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addPlayerButton: {
    flex: 1,
    marginRight: 12,
  },
  counterText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[700],
  },
  footer: {
    marginTop: 24,
  },
});
