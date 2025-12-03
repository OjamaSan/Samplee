// src/screens/PlayerEditScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '../theme/theme';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { AvatarPicker } from '../components/AvatarPicker';
import { AVATARS } from '../data/avatars';
import { usePlayers } from '../context/PlayersContext';

export function PlayerEditScreen() {
  const { playerId } = useLocalSearchParams();
  const { players, setPlayers } = usePlayers();

  const player = players.find(
    (p) => p.id === String(playerId)
  );

  const [name, setName] = useState(player?.name ?? '');
  const [avatarId, setAvatarId] = useState(
    player?.avatarId ?? AVATARS[0]?.id
  );

  useEffect(() => {
    if (player) {
      setName(player.name);
      setAvatarId(player.avatarId ?? AVATARS[0]?.id);
    }
  }, [player]);

  const handleBack = () => {
    router.replace('/(tabs)/player-setup');
  };

  const handleSave = () => {
    const safeName = name
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!safeName) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === String(playerId)
          ? {
              ...p,
              name: safeName,
              avatarId,
            }
          : p
      )
    );

    router.replace('/(tabs)/player-setup');
  };

  if (!player) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            Player not found.
          </Text>
          <View style={styles.errorButtonWrapper}>
            <Button
              title="Back"
              variant="light"
              tone="rouge"
              size="sm"
              onPress={handleBack}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      {/* Header avec bouton Back */}
      <View style={styles.headerRow}>
        <View style={styles.backButtonWrapper}>
          <Button
            variant="light"
            tone="rouge"
            size="sm"
            title="Back"
            onPress={handleBack}
          />
        </View>
      </View>

      {/* Titre */}
      <Text style={[theme.typography.headingLg, styles.title]}>
        Edit player
      </Text>

      {/* Bloc pseudo + avatar */}
      <View style={styles.card}>
        {/* Nickname FIRST */}
        <Text style={[theme.typography.bodyMd, styles.sectionLabel]}>
          Nickname
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter a name"
          placeholderTextColor={theme.colors.gray[500]}
          style={styles.input}
          maxLength={16}
          multiline={false}
        />

        {/* Avatar SECOND */}
        <Text style={[theme.typography.bodyMd, styles.sectionLabel]}>
          Choose an avatar
        </Text>

        <AvatarPicker
          selectedId={avatarId}
          onSelect={setAvatarId}
        />
      </View>

      {/* Bouton Save */}
      <View style={styles.footer}>
        <Button
          title="Save changes"
          variant="solid"
          tone="green"
          size="lg"
          onPress={handleSave}
          disabled={!name.trim()}
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
  sectionLabel: {
    color: theme.colors.rouge[700],
    marginBottom: 8,
  },
  input: {
    marginTop: 4,
    marginBottom: 24, // plus d'espace avant les avatars
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.rouge[300],
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[700],
    backgroundColor:
      theme.colors.rouge[50] || theme.colors.rouge[100],
  },
  footer: {
    marginTop: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[100],
    marginBottom: 16,
  },
  errorButtonWrapper: {
    width: 120,
  },
});
