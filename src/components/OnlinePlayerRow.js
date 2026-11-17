// src/components/OnlinePlayerRow.js
//
// Ligne joueur pour le mode en ligne : avatar, pseudo, badges
// (hôte, "toi", hors ligne) et une zone d'action optionnelle à droite.

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AVATARS } from '../data/avatars';
import { theme } from '../theme/theme';

function getAvatarSource(avatarId) {
  return AVATARS.find((a) => a.id === avatarId)?.source ?? null;
}

export function OnlinePlayerRow({
  player,
  isMe = false,
  textColor = theme.colors.rouge[700],
  right = null,
}) {
  const avatarSource = getAvatarSource(player.avatarId);
  const tags = [
    player.isHost && 'host',
    isMe && 'you',
    !player.isConnected && 'offline',
  ].filter(Boolean);

  return (
    <View style={[styles.row, !player.isConnected && styles.offline]}>
      <View style={styles.info}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
        <View style={styles.texts}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {player.name}
          </Text>
          {tags.length > 0 && (
            <Text style={[styles.tags, { color: textColor }]}>
              {tags.join(' · ')}
            </Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offline: {
    opacity: 0.45,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.gray[200],
  },
  texts: {
    flex: 1,
  },
  name: {
    ...theme.typography.bodyMd,
  },
  tags: {
    ...theme.typography.bodySmCondensed,
    opacity: 0.8,
  },
});
