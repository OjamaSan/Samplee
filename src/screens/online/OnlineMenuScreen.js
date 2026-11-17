// src/screens/online/OnlineMenuScreen.js
//
// Point d'entrée du mode en ligne : on choisit son pseudo / avatar,
// puis on crée une partie ou on en rejoint une avec un code.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { ProfileForm } from '../../components/ProfileForm';
import { ScreenContainer } from '../../components/ScreenContainer';
import { loadProfile, saveProfile } from '../../online/localProfile';
import {
  createRoom,
  isValidCode,
  joinRoom,
  normalizeCode,
  sanitizeName,
} from '../../online/roomApi';
import { theme } from '../../theme/theme';

export function OnlineMenuScreen({ onBack, onEnterRoom }) {
  const [profile, setProfile] = useState(() => loadProfile());
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(null); // 'create' | 'join' | null
  const [error, setError] = useState('');

  const hasName = sanitizeName(profile.name).length > 0;
  const canJoin = hasName && isValidCode(code);

  const run = async (kind, action) => {
    setError('');
    setBusy(kind);
    try {
      saveProfile(profile);
      const roomCode = await action();
      onEnterRoom?.(roomCode);
    } catch (err) {
      setError(err?.message || 'Something went wrong, please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleCreate = () => run('create', () => createRoom(profile));

  const handleJoin = () =>
    run('join', async () => {
      const roomCode = normalizeCode(code);
      await joinRoom(roomCode, profile);
      return roomCode;
    });

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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

        <Text style={[theme.typography.headingLg, styles.title]}>
          Play online
        </Text>

        <ProfileForm profile={profile} onChange={setProfile} />

        {/* Créer une partie */}
        <View style={styles.section}>
          <Button
            title="Create a game"
            variant="solid"
            tone="green"
            size="lg"
            onPress={handleCreate}
            disabled={!hasName || busy !== null}
          />
        </View>

        {/* Rejoindre une partie */}
        <Text style={[theme.typography.headingSm, styles.orText]}>
          or join a friend&apos;s game
        </Text>

        <View style={styles.joinRow}>
          <TextInput
            value={code}
            onChangeText={(text) => setCode(normalizeCode(text))}
            placeholder="CODE"
            placeholderTextColor={theme.colors.rouge[300]}
            style={styles.codeInput}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={4}
            onSubmitEditing={() => canJoin && handleJoin()}
          />
          <View style={styles.joinButtonWrapper}>
            <Button
              title="Join"
              variant="solid"
              tone="blue"
              size="lg"
              onPress={handleJoin}
              disabled={!canJoin || busy !== null}
            />
          </View>
        </View>

        {!hasName && (
          <Text style={styles.hintText}>
            Enter a nickname to create or join a game.
          </Text>
        )}

        {busy && (
          <ActivityIndicator
            style={styles.spinner}
            color={theme.colors.rouge[100]}
          />
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </ScreenContainer>
  );
}

export default OnlineMenuScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.rouge[500],
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
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
  section: {
    marginTop: 24,
  },
  orText: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    // Sans ça, le navigateur impose une largeur mini (~20 caractères)
    // au champ, qui pousse le bouton Join hors de l'écran sur téléphone.
    minWidth: 0,
    height: 75,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: theme.colors.rouge[700],
    backgroundColor: theme.colors.rouge[100],
    color: theme.colors.rouge[700],
    textAlign: 'center',
    letterSpacing: 8,
    ...theme.typography.headingMd,
  },
  joinButtonWrapper: {
    width: 150,
  },
  hintText: {
    ...theme.typography.bodySmCondensed,
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginTop: 12,
  },
  spinner: {
    marginTop: 16,
  },
  errorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[100],
    backgroundColor: theme.colors.rouge[700],
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
