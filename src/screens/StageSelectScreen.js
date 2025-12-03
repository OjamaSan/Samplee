// src/screens/StageSelectScreen.js

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  PanResponder,
} from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';
import { STAGES } from '../data/stages';
import { AVATARS } from '../data/avatars';

const CARD_WIDTH = 300;
const CARD_HEIGHT = 450;
const SCREEN_HORIZONTAL_PADDING = 24; // comme PlayerSetup

// utilitaire : retrouver la source d'un avatar à partir de son id
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

export function StageSelectScreen({ onBack, onPlay, isStagePlayable } = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const currentStage = useMemo(
    () => STAGES[currentIndex],
    [currentIndex]
  );

    const isPlayable =
    typeof isStagePlayable === 'function'
      ? isStagePlayable(currentStage.id)
      : true;


  const goToIndex = (index) => {
    const lastIndex = STAGES.length - 1;
    const target =
      index < 0 ? lastIndex : index > lastIndex ? 0 : index;
    setCurrentIndex(target);
  };

  const handleNext = () => {
    goToIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    goToIndex(currentIndex - 1);
  };

  const handlePlay = () => {
    if (!isPlayable) return;
    if (onPlay) {
      onPlay(currentStage);
    }
  };


  // Swipe left/right sur la carte pour changer de stage
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10, // on déclenche sur mouvement horizontal
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (dx < -40) {
          // swipe vers la gauche → stage suivant
          handleNext();
        } else if (dx > 40) {
          // swipe vers la droite → stage précédent
          handlePrev();
        }
      },
    })
  ).current;

  const avatarSources = (currentStage.avatarIds || [])
    .map((id) => getAvatarSource(id))
    .filter(Boolean);

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

      {/* Carte centrale + zone de swipe */}
      <View style={styles.cardWrapper}>
        <View
          style={styles.swipeZone}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              styles.stageCard,
              {
                backgroundColor: currentStage.colors.fill,
                borderColor: currentStage.colors.border,
              },
            ]}
          >
            {/* Titre + période */}
            <View style={styles.stageHeader}>
              <Text
                style={[theme.typography.headingLg, styles.stageTitle]}
              >
                {currentStage.title}
              </Text>
              <Text
                style={[theme.typography.headingMd, styles.stagePeriod]}
              >
                {currentStage.periodLabel}
              </Text>
            </View>

            {/* Avatars centrés */}
            <View style={styles.avatarsRow}>
              {avatarSources.map((src, i) => (
                <Image
                  key={i}
                  source={src}
                  style={styles.avatar}
                  resizeMode="contain"
                />
              ))}
            </View>

            {/* Nombre de questions + difficulté */}
            <View style={styles.metaContainer}>
              <Text
                style={[theme.typography.headingLg, styles.questionsText]}
              >
                {currentStage.questionCount} questions
              </Text>
              <Text
                style={[
                  theme.typography.headingMd,
                  styles.difficultyText,
                ]}
              >
                {currentStage.difficultyLabel}
              </Text>
            </View>
          </View>
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
  },
  swipeZone: {
    width: '100%',
    alignItems: 'center',
  },
  stageCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32,
    borderWidth: 9,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  stageHeader: {
    alignItems: 'center',
  },
  stageTitle: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
  },
  stagePeriod: {
    color: theme.colors.rouge[100],
    marginTop: 4,
    textAlign: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 16,
  },
  metaContainer: {
    alignItems: 'center',
  },
  questionsText: {
    color: theme.colors.rouge[100],
    marginBottom: 8,
    textAlign: 'center',
  },
  difficultyText: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
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
