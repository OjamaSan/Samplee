// src/components/ProfileForm.js
//
// Pseudo + avatar, dans une carte. Utilisé pour créer ou rejoindre
// une partie en ligne.

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme/theme';
import { AvatarPicker } from './AvatarPicker';

export function ProfileForm({ profile, onChange, takenAvatarIds = [] }) {
  return (
    <View style={styles.card}>
      <Text style={[theme.typography.bodyMd, styles.label]}>Nickname</Text>
      <TextInput
        value={profile.name}
        onChangeText={(name) => onChange({ ...profile, name })}
        placeholder="Enter a name"
        placeholderTextColor={theme.colors.gray[500]}
        style={styles.input}
        maxLength={16}
        autoCorrect={false}
      />

      <Text style={[theme.typography.bodyMd, styles.label]}>
        Choose an avatar
      </Text>
      <AvatarPicker
        selectedId={profile.avatarId}
        onSelect={(avatarId) => onChange({ ...profile, avatarId })}
        dimmedIds={takenAvatarIds}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.rouge[100],
    borderRadius: 16,
    padding: 24,
  },
  label: {
    color: theme.colors.rouge[700],
    marginBottom: 8,
  },
  input: {
    marginTop: 4,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.rouge[300],
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[700],
    backgroundColor: theme.colors.rouge[50] || theme.colors.rouge[100],
  },
});
