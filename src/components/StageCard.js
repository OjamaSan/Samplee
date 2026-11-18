// src/components/StageCard.js
//
// Carte d'un stage, façon pochette de vinyle : titre en sticker, disque
// qui dépasse sur la droite, persos posés dessus comme des photos, et
// une étiquette claire en bas avec les infos du stage.

import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AVATARS } from '../data/avatars';
import { theme } from '../theme/theme';

export const STAGE_CARD_WIDTH = 300;
export const STAGE_CARD_HEIGHT = 450;
export const STAGE_CARD_RADIUS = 28;

const DISC_SIZE = 230;
const DISC_GROOVES = [0.92, 0.82, 0.72, 0.62, 0.52];

function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  return AVATARS.find((a) => a.id === avatarId)?.source ?? null;
}

const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

export function StageCard({ stage }) {
  const palette = theme.colors[stage.colorFamily] ?? theme.colors.turquoise;
  const [avatar1, avatar2] = (stage.avatarIds || []).map(getAvatarSource);

  return (
    <View style={[styles.shadowWrapper, { boxShadow: `0px 7px 0px ${palette[900]}` }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: palette[500], borderColor: palette[700] },
        ]}
      >
        {/* Pochette */}
        <View style={styles.sleeve}>
          {/* Disque */}
          <View style={[styles.disc, { backgroundColor: palette[900] }]}>
            {DISC_GROOVES.map((ratio) => (
              <View
                key={ratio}
                style={[
                  styles.groove,
                  {
                    width: DISC_SIZE * ratio,
                    height: DISC_SIZE * ratio,
                    borderRadius: (DISC_SIZE * ratio) / 2,
                    borderColor: palette[700],
                  },
                ]}
              />
            ))}
            <View style={[styles.discLabel, { backgroundColor: palette[300] }]}>
              <View style={[styles.discHole, { backgroundColor: palette[900] }]} />
            </View>
          </View>

          {/* Persos */}
          {avatar1 && (
            <Image
              source={avatar1}
              style={[styles.avatar, styles.avatarFirst, { borderColor: palette[100] }]}
            />
          )}
          {avatar2 && (
            <Image
              source={avatar2}
              style={[styles.avatar, styles.avatarSecond, { borderColor: palette[100] }]}
            />
          )}

          {/* Titre en sticker */}
          <View style={styles.titleRow}>
            <View
              style={[
                styles.titleSticker,
                {
                  backgroundColor: palette[100],
                  boxShadow: `0px 4px 0px ${palette[900]}`,
                },
              ]}
            >
              <Text style={[styles.titleText, { color: palette[900] }]} numberOfLines={1}>
                {stage.title}
              </Text>
            </View>
          </View>
        </View>

        {/* Étiquette : infos du stage */}
        <View style={[styles.label, { backgroundColor: palette[100] }]}>
          <Text style={[styles.periodText, { color: palette[900] }]}>
            {stage.periodLabel}
          </Text>
          <View style={styles.chipsRow}>
            <View style={[styles.chip, { backgroundColor: palette[200] }]}>
              <Ionicons name="musical-notes" size={14} color={palette[900]} />
              <Text style={[styles.chipText, { color: palette[900] }]}>
                {stage.questionCount} questions
              </Text>
            </View>
            {!!stage.difficulty && (
              <View style={[styles.chip, { backgroundColor: palette[200] }]}>
                <Ionicons name="stats-chart" size={13} color={palette[900]} />
                <Text style={[styles.chipText, { color: palette[900] }]}>
                  {capitalize(stage.difficulty)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default StageCard;

const AVATAR_SIZE = 124;

const styles = StyleSheet.create({
  shadowWrapper: {
    width: STAGE_CARD_WIDTH,
    height: STAGE_CARD_HEIGHT,
    borderRadius: STAGE_CARD_RADIUS,
  },
  card: {
    flex: 1,
    borderRadius: STAGE_CARD_RADIUS,
    borderWidth: 6,
    overflow: 'hidden',
  },
  sleeve: {
    flex: 1,
    overflow: 'hidden',
  },
  disc: {
    position: 'absolute',
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    right: -78,
    top: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groove: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  discLabel: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discHole: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  avatar: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 18,
    borderWidth: 4,
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.22)',
  },
  avatarFirst: {
    left: 20,
    top: 84,
    transform: [{ rotate: '-7deg' }],
  },
  avatarSecond: {
    left: 106,
    top: 184,
    transform: [{ rotate: '5deg' }],
  },
  titleRow: {
    position: 'absolute',
    top: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titleSticker: {
    maxWidth: STAGE_CARD_WIDTH - 60,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 14,
    transform: [{ rotate: '-4deg' }],
  },
  titleText: {
    ...theme.typography.headingMd,
    fontSize: 26,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  label: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  periodText: {
    ...theme.typography.headingSm,
    fontSize: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    ...theme.typography.bodySmCondensed,
    fontSize: 16,
  },
});
