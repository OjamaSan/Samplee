// src/components/Button.js

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { theme } from '../theme/theme';

/**
 * Props:
 *  - title?: string
 *  - icon?: ReactNode
 *  - variant?: 'solid' | 'light'
 *  - size?: 'lg' | 'sm'
 *  - tone?: 'rouge' | 'turquoise' | 'blue' | 'green' | 'gray'
 *  - onPress?: () => void
 *  - disabled?: boolean
 */
export function Button({
  title,
  icon,
  variant = 'solid',
  size = 'lg',
  tone = 'rouge',
  onPress,
  style,
  disabled = false,
}) {
  const pressedAnim = useRef(new Animated.Value(0)).current;

  const palette = theme.colors[tone] || theme.colors.rouge;
  const isSolid = variant === 'solid';
  const isLarge = size === 'lg';
  const isIconOnly = !!icon && !title;

  // Specs DS
  const shadowOffsetBase = isLarge ? 7 : 4;
  const borderRadius = isLarge ? 18 : 12;
  const buttonHeight = isLarge ? 75 : 44; // approx visuel Figma

  const paddingVertical = isLarge ? 16 : 8;
  const paddingHorizontal =
    isLarge ? 24 : icon && !title ? 8 : 16;

  // Largeur mini :
  //  - icon-only → carré-ish
  //  - lg → 150
  //  - sm → auto
  const minWidth = isIconOnly
    ? (isLarge ? buttonHeight : 40)
    : isLarge
    ? 150
    : undefined;

  // Anim : le bouton descend, l'ombre monte jusqu'au haut
  const buttonTranslateY = pressedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, shadowOffsetBase],
  });

  const shadowTranslateY = pressedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [shadowOffsetBase, 0],
  });

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(pressedAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.timing(pressedAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const textStyle =
    size === 'lg'
      ? theme.typography.headingMd
      : theme.typography.headingSm;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          // Hauteur = bouton + offset d'ombre d'un seul côté
          height: buttonHeight + shadowOffsetBase,
        },
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        style={styles.pressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {({ pressed }) => {
          // --- Couleurs en fonction de l'état ---

          // Corps du bouton
          const backgroundColor = disabled
            ? theme.colors.gray[300]
            : isSolid
            ? pressed
              ? palette[700]
              : palette[500]
            : pressed
            ? palette[200]
            : palette[100];

          // Ombre
          const shadowColor = disabled
            ? theme.colors.gray[500]
            : pressed
            ? palette[900]
            : palette[700];

          // Texte
          const textColor = disabled
            ? theme.colors.gray[100]
            : isSolid
            ? palette[100]
            : pressed
            ? palette[900]
            : palette[700];

          // Icône : si disabled, on force aussi la couleur en gray[100]
          let renderedIcon = icon;
          if (icon && disabled && React.isValidElement(icon)) {
            renderedIcon = React.cloneElement(icon, {
              style: [
                icon.props.style,
                { color: theme.colors.gray[100] },
              ],
            });
          }

          return (
            <View style={styles.innerContainer}>
              {/* Ombre */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shadow,
                  {
                    height: buttonHeight,
                    borderRadius,
                    backgroundColor: shadowColor,
                    transform: [{ translateY: shadowTranslateY }],
                  },
                ]}
              />

              {/* Bouton */}
              <Animated.View
                style={[
                  styles.buttonBase,
                  {
                    height: buttonHeight,
                    borderRadius,
                    backgroundColor,
                    paddingVertical,
                    paddingHorizontal,
                    transform: [{ translateY: buttonTranslateY }],
                    minWidth,
                  },
                ]}
              >
                <View style={styles.contentRow}>
                  {renderedIcon && (
                    <View
                      style={[
                        styles.iconWrapper,
                        title && { marginRight: 8 },
                      ]}
                    >
                      {renderedIcon}
                    </View>
                  )}
                  {title && (
                    <Text
                      style={[
                        textStyle,
                        styles.text,
                        { color: textColor },
                      ]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                  )}
                </View>
              </Animated.View>
            </View>
          );
        }}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'stretch',
  },
  pressable: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  buttonBase: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
