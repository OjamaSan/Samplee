// src/screens/StageSelectScreen.js

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Pressable,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { STAGES } from '../data/stages';
import {
  STAGE_CARD_HEIGHT,
  STAGE_CARD_RADIUS,
  STAGE_CARD_WIDTH,
  StageCard,
} from '../components/StageCard';

const CARD_WIDTH = STAGE_CARD_WIDTH;
const CARD_HEIGHT = STAGE_CARD_HEIGHT;
const SCREEN_HORIZONTAL_PADDING = 24; // comme PlayerSetup

// Carrousel : écart horizontal entre deux cartes, et ressort du calage
const CARD_SPACING = CARD_WIDTH * 0.62;
const SPRING = { damping: 18, stiffness: 160, mass: 0.9 };
const SWIPE_THRESHOLD = 40;

const wrapIndex = (index, count) => ((index % count) + count) % count;

export function StageSelectScreen({ onBack, onPlay, isStagePlayable } = {}) {
  const count = STAGES.length;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Position du carrousel en "nombre de cartes" (non bornée : le carrousel
  // boucle). Elle suit le doigt pendant le swipe, puis se cale en douceur.
  const position = useSharedValue(0);
  const targetRef = useRef(0);

  const goTo = (target) => {
    targetRef.current = target;
    setCurrentIndex(wrapIndex(target, count));
    position.value = withSpring(target, SPRING);
  };

  const handleNext = () => goTo(targetRef.current + 1);
  const handlePrev = () => goTo(targetRef.current - 1);

  // Tap sur une carte voisine : on la ramène au centre par le plus court chemin
  const handleCardPress = (index) => {
    const current = targetRef.current;
    let delta = wrapIndex(index - current, count);
    if (delta > count / 2) delta -= count;
    if (delta !== 0) goTo(current + delta);
  };

  // Swipe : les cartes suivent le doigt, puis se calent sur la plus proche
  // (au moins une carte d'écart dès que le geste dépasse le seuil).
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        position.value = targetRef.current - g.dx / CARD_SPACING;
      },
      onPanResponderRelease: (_, g) => {
        const start = targetRef.current;
        let steps = Math.round(-g.dx / CARD_SPACING);
        if (steps === 0 && Math.abs(g.dx) > SWIPE_THRESHOLD) {
          steps = g.dx < 0 ? 1 : -1;
        }
        goTo(start + steps);
      },
      onPanResponderTerminate: () => goTo(targetRef.current),
    })
  ).current;

  if (!STAGES || STAGES.length === 0) {
    return (
      <ScreenContainer style={styles.container}>
        <Text style={[theme.typography.headingLg, styles.title]}>
          Select stage
        </Text>
        <Text style={styles.emptyText}>
          No stages configured yet.
        </Text>
      </ScreenContainer>
    );
  }

  const currentStage = STAGES[currentIndex];

  const isPlayable =
    typeof isStagePlayable === 'function'
      ? isStagePlayable(currentStage.id)
      : true;

  const handlePlay = () => {
    if (!isPlayable) return;
    if (onPlay) {
      onPlay(currentStage);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* Back optionnel */}
      <View style={styles.headerRow}>
        {onBack && (
          <View style={styles.backButtonWrapper}>
            <Button
              variant="light"
              tone="rouge"
              size="sm"
              title="Back"
              onPress={onBack}
            />
          </View>
        )}
      </View>

      {/* Titre */}
      <Text style={[theme.typography.headingLg, styles.title]}>
        Select stage
      </Text>

      {/* Carrousel des stages */}
      <View style={styles.cardWrapper}>
        <View style={styles.swipeZone} {...panResponder.panHandlers}>
          {STAGES.map((stage, index) => (
            <CarouselCard
              key={stage.id}
              stage={stage}
              index={index}
              count={count}
              position={position}
              onPress={() => handleCardPress(index)}
            />
          ))}
        </View>
      </View>

      {/* Boutons : ←  Play  → */}
      <View style={styles.controlsRow}>
        <View style={styles.iconButtonWrapper}>
          <Button
            variant="solid"
            tone="blue"
            size="lg"
            onPress={handlePrev}
            icon={<Text style={styles.iconText}>◀</Text>}
          />
        </View>

        <View style={styles.playButtonWrapper}>
          <Button
            variant="solid"
            tone="green"
            size="lg"
            title="Play"
            onPress={handlePlay}
            disabled={!isPlayable}
          />
        </View>

        <View style={styles.iconButtonWrapper}>
          <Button
            variant="solid"
            tone="blue"
            size="lg"
            onPress={handleNext}
            icon={<Text style={styles.iconText}>▶</Text>}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

export default StageSelectScreen;

/**
 * Une carte du carrousel. Sa place dépend de son écart avec la position
 * courante : au centre en grand, les voisines plus petites, plus sombres
 * et derrière, les autres cachées.
 */
function CarouselCard({ stage, index, count, position, onPress }) {
  const cardStyle = useAnimatedStyle(() => {
    // Écart (en cartes) le plus court, le carrousel bouclant
    let offset = (((index - position.value) % count) + count) % count;
    if (offset > count / 2) offset -= count;
    const distance = Math.abs(offset);

    return {
      zIndex: Math.round(100 - distance * 10),
      opacity: interpolate(distance, [0, 1, 1.6, 2], [1, 1, 0.6, 0], 'clamp'),
      transform: [
        { translateX: offset * CARD_SPACING },
        { scale: interpolate(distance, [0, 1, 2], [1, 0.8, 0.65], 'clamp') },
      ],
    };
  });

  const shadeStyle = useAnimatedStyle(() => {
    let offset = (((index - position.value) % count) + count) % count;
    if (offset > count / 2) offset -= count;
    return {
      opacity: interpolate(Math.abs(offset), [0, 1], [0, 0.45], 'clamp'),
    };
  });

  return (
    <Animated.View style={[styles.carouselItem, cardStyle]}>
      <Pressable onPress={onPress}>
        <StageCard stage={stage} />
        {/* Assombrissement des cartes en arrière-plan */}
        <Animated.View pointerEvents="none" style={[styles.cardShade, shadeStyle]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.rouge[500],
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    marginBottom: 16,
    minHeight: 32,
  },
  backButtonWrapper: {
    width: 120,
    alignSelf: 'flex-start',
  },
  title: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginTop: 16,
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Le carrousel déborde jusqu'aux bords de l'écran
    marginHorizontal: -SCREEN_HORIZONTAL_PADDING,
    overflow: 'hidden',
  },
  swipeZone: {
    width: '100%',
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselItem: {
    position: 'absolute',
  },
  cardShade: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: STAGE_CARD_RADIUS,
    backgroundColor: '#000',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  iconButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  playButtonWrapper: {
    flex: 1.4,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconText: {
    ...theme.typography.headingSm,
    color: theme.colors.rouge[100],
  },
});
