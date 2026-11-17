// src/components/AvatarPicker.js

import React from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme/theme';
import { AVATARS } from '../data/avatars';

export function AvatarPicker({
  avatars = AVATARS,
  selectedId,
  onSelect,
  // Avatars déjà choisis par d'autres joueurs : affichés en transparence
  // (toujours sélectionnables, c'est juste une indication).
  dimmedIds = [],
}) {
  return (
    <View style={styles.grid}>
      {avatars.map((avatar) => {
        const isSelected = avatar.id === selectedId;
        const isDimmed = !isSelected && dimmedIds.includes(avatar.id);

        return (
          <Pressable
            key={avatar.id}
            onPress={() => onSelect?.(avatar.id)}
            style={[
              styles.avatarWrapper,
              isSelected && styles.avatarWrapperSelected,
              isDimmed && styles.avatarWrapperDimmed,
            ]}
          >
            <Image
              source={avatar.source}
              style={styles.avatarImage}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[200],
    borderWidth: 4,
    borderColor: 'transparent',
  },
  avatarWrapperSelected: {
    borderColor: theme.colors.rouge[500],
  },
  avatarWrapperDimmed: {
    opacity: 0.35,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
