// src/components/Podium.js
//
// Podium dessiné en code d'après les maquettes (podium.svg et variantes
// d'égalité) : une marche par joueur, or / argent / bronze selon le rang,
// avec l'ombre décalée à droite et le numéro du rang. Fonctionne pour
// tous les cas d'égalité (1-1-2, 1-2-2, 1-2-3-3, 1-1-1-1…).

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AVATARS } from '../data/avatars';
import { theme } from '../theme/theme';

// Couleurs et proportions reprises de podium.svg (marche de 252 + ombre 23)
const STEP_COLORS = {
  1: { face: '#FDCD09', shade: '#BC9800' },
  2: { face: '#D2D2D2', shade: '#999999' },
  3: { face: '#C36A28', shade: '#994A14' },
};
const SVG_SLOT = 275;
const SVG_FACE = 252;
const SVG_RADIUS = 12;
const SVG_HEIGHTS = { 1: 335, 2: 259, 3: 210 };
const SVG_NUMBER_TOP = { 1: 40, 2: 50, 3: 38 };
const SVG_NUMBER_SIZE = 150;

function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  return AVATARS.find((a) => a.id === avatarId)?.source ?? null;
}

/**
 * Props :
 *  - slots : joueurs dans l'ordre d'affichage, avec { id, name, avatarId, rank }
 *    (voir getPodiumSlots)
 *  - width : largeur disponible
 */
export function Podium({ slots, width }) {
  // Au moins la largeur de 3 marches, pour garder les proportions
  const slotWidth = width / Math.max(slots.length, 3);
  const k = slotWidth / SVG_SLOT;
  const avatarSize = Math.min(56, slotWidth - 12);

  return (
    <View style={[styles.row, { width }]}>
      {slots.map((player) => {
        const rank = Math.min(Math.max(player.rank, 1), 3);
        const colors = STEP_COLORS[rank];
        const height = SVG_HEIGHTS[rank] * k;
        const faceWidth = SVG_FACE * k;
        const shadeOffset = (SVG_SLOT - SVG_FACE) * k;
        const radius = SVG_RADIUS * k;
        const avatarSource = getAvatarSource(player.avatarId);

        return (
          <View key={player.id} style={[styles.slot, { width: slotWidth }]}>
            <View
              style={[
                styles.avatarWrapper,
                { width: avatarSize, height: avatarSize },
                player.isConnected === false && styles.offline,
              ]}
            >
              {avatarSource && <Image source={avatarSource} style={styles.avatar} />}
            </View>
            <Text
              style={[styles.name, { maxWidth: slotWidth - 4 }]}
              numberOfLines={1}
            >
              {player.name}
            </Text>

            {/* Marche : ombre décalée à droite + face + numéro */}
            <View style={{ width: slotWidth, height }}>
              <View
                style={[
                  styles.step,
                  {
                    left: shadeOffset,
                    width: faceWidth,
                    height,
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                    backgroundColor: colors.shade,
                  },
                ]}
              />
              <View
                style={[
                  styles.step,
                  {
                    left: 0,
                    width: faceWidth,
                    height,
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                    backgroundColor: colors.face,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.number,
                    {
                      color: colors.shade,
                      fontSize: SVG_NUMBER_SIZE * k,
                      lineHeight: SVG_NUMBER_SIZE * k * 1.1,
                      marginTop: SVG_NUMBER_TOP[rank] * k,
                    },
                  ]}
                >
                  {player.rank}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default Podium;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    alignSelf: 'center',
  },
  slot: {
    alignItems: 'center',
  },
  avatarWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[200],
    marginBottom: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offline: {
    opacity: 0.45,
  },
  name: {
    ...theme.typography.bodySm,
    color: theme.colors.rouge[700],
    textAlign: 'center',
    marginBottom: 6,
  },
  step: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  number: {
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});
