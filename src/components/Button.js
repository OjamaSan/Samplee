// src/components/Button.js

import React, { useEffect, useRef } from 'react';
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
 *  - active?: boolean : reste affiché enfoncé (ex. pendant une lecture audio).
 *      Un bouton actif garde ses couleurs même s'il est désactivé.
 *  - progress?: Animated.Value (0 → 1) : remplit le bouton de gauche à droite
 *      d'une teinte un peu plus foncée que l'état enfoncé (barre de progression).
 *  - minWidth?: number : remplace la largeur mini par défaut (ex. 0 quand le
 *      bouton doit pouvoir rétrécir avec l'écran).
 */
export function Button({
  title,
  icon,
  variant = 'solid',
  size = 'lg',
  tone = 'rouge',
  onPress,
  style,
  disabled: disabledProp = false,
  active = false,
  progress = null,
  minWidth: minWidthProp,
}) {
  const pressedAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const activeRef = useRef(active);
  activeRef.current = active;

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
  const defaultMinWidth = isIconOnly
    ? (isLarge ? buttonHeight : 40)
    : isLarge
    ? 150
    : undefined;
  const minWidth = minWidthProp ?? defaultMinWidth;

  // Anim : le bouton descend et vient recouvrir son ombre colorée
  // (qui ne bouge pas) ; l'ombre noire floue s'efface.
  const buttonTranslateY = pressedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, shadowOffsetBase],
  });

  const shadowOpacity = pressedAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const animateTo = (toValue) => {
    Animated.timing(pressedAnim, {
      toValue,
      duration: toValue ? 80 : 120,
      useNativeDriver: true,
    }).start();
  };

  // Bouton maintenu enfoncé tant qu'il est actif
  useEffect(() => {
    animateTo(active ? 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handlePressIn = () => {
    if (disabledProp) return;
    animateTo(1);
  };

  const handlePressOut = () => {
    if (disabledProp || activeRef.current) return;
    animateTo(0);
  };

  const blurShadow = isLarge
    ? '0px 5px 8px rgba(0, 0, 0, 0.28)'
    : '0px 3px 6px rgba(0, 0, 0, 0.26)';

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
        disabled={disabledProp}
        style={styles.pressable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {({ pressed: isPressedNow }) => {
          const pressed = isPressedNow || active;
          // Un bouton actif garde ses couleurs, même désactivé
          const disabled = disabledProp && !active;

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

          // Ombre colorée (cachée sous le bouton quand il est enfoncé)
          const shadowColor = disabled ? theme.colors.gray[500] : palette[700];

          // Remplissage de la barre de progression
          const progressColor = isSolid ? palette[900] : palette[300];

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
              {/* Ombres : colorée nette + noire floue, à l'état normal */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shadow,
                  {
                    height: buttonHeight,
                    borderRadius,
                    backgroundColor: shadowColor,
                    boxShadow: blurShadow,
                    opacity: shadowOpacity,
                    transform: [{ translateY: shadowOffsetBase }],
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
                {progress && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: progressColor,
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                )}
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
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
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
