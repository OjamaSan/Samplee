// src/screens/CorrectionQuestionScreen.js

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { ScreenContainer } from '../components/ScreenContainer';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { usePlayers } from '../context/PlayersContext';
import { AVATARS } from '../data/avatars';
import { getStageTheme } from '../theme/stageTheme';

// ---------- utils avatars ----------
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

// ---------- utils scoring & fuzzy match ----------

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/é|è|ê/g, 'e')
    .replace(/à/g, 'a')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function isCloseMatch(user, expected, maxRatio = 0.35) {
  const a = normalize(user);
  const b = normalize(expected);
  if (!a || !b) return false;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return dist <= Math.ceil(maxLen * maxRatio);
}


function isArtistCorrect(userArtist, correctArtist) {
  const normalized = normalize(correctArtist);

  // On découpe tous les artistes possibles :
  // "beyonce ft jay z" → ["beyonce", "jay z"]
  const parts = normalized
    .split(/\b(ft|ft\.|feat|feat\.|featuring|&|and)\b/g)
    .map((p) => p.trim())
    .filter(Boolean);

  // On ajoute aussi la chaîne complète comme candidat
  const candidates = [normalized, ...parts];

  // Si la réponse du joueur est proche de l’un des artistes → OK
  return candidates.some((candidate) =>
    isCloseMatch(userArtist, candidate)
  );
}


function isSongCorrect(userSong, correctSong) {
  return isCloseMatch(userSong, correctSong);
}

function computeScoreForPlayer(playerAnswer, correctAnswer) {
  if (!playerAnswer) return { artistOk: false, songOk: false, score: 0 };

  const artistOk = isArtistCorrect(playerAnswer.artist, correctAnswer.artist);
  const songOk = isSongCorrect(playerAnswer.song, correctAnswer.song);
  const score = (artistOk ? 1 : 0) + (songOk ? 1 : 0);

  return { artistOk, songOk, score };
}

/**
 * Props:
 *  - question : {
 *      id, stageId, title, coverSource,
 *      answerTitle, answerCoverSource,
 *      correctionAudioSource, correctionSteps, correctAnswer
 *    }
 *  - answersByPlayer: { [playerId]: { artist: string, song: string } }
 *  - onNext: () => void
 */
export function CorrectionQuestionScreen({ question, answersByPlayer, onNext }) {
  const { players } = usePlayers();

  // thème du stage
  const stageTheme = getStageTheme(question.stageId);
  const tone = stageTheme.family;

  // audio + animation reveal
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [infoText, setInfoText] = useState('');
  const soundRef = useRef(null);
  const timeoutsRef = useRef([]);

  // mode liste / détail joueur
  const [activePlayerId, setActivePlayerId] = useState(null);

  // titre + cover affichés (sample ou réponse selon reveal)
  const isRevealed = hasRevealed;
  const topTitle = isRevealed ? question.answerTitle : question.title;
  const topCoverSource = isRevealed
    ? question.answerCoverSource
    : question.coverSource;

  const scoresByPlayer = useMemo(() => {
    const result = {};
    players.forEach((p) => {
      const ans = answersByPlayer?.[p.id] || { artist: '', song: '' };
      result[p.id] = computeScoreForPlayer(ans, question.correctAnswer);
    });
    return result;
  }, [players, answersByPlayer, question.correctAnswer]);

  // charge / libère le son de correction
  useEffect(() => {
    let isMounted = true;

    async function loadSound() {
      if (!question?.correctionAudioSource) return;
      const { sound } = await Audio.Sound.createAsync(
        question.correctionAudioSource,
        { shouldPlay: false },
        async (status) => {
          if (!isMounted) return;
          if (status.didJustFinish) {
            setIsPlaying(false);
            // on ne reset pas le reveal, on laisse tout affiché
          }
        }
      );
      soundRef.current = sound;
    }

    // reset états quand la question change
    setIsPlaying(false);
    setHasPlayedOnce(false);
    setHasRevealed(false);
    setInfoText('');
    setActivePlayerId(null);
    clearAllTimers();

    // nettoyer ancien son
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    loadSound();

    return () => {
      isMounted = false;
      clearAllTimers();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [question?.id]);

  const clearAllTimers = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const scheduleCorrectionSteps = () => {
    clearAllTimers();
    if (!question.correctionSteps || question.correctionSteps.length === 0)
      return;

    question.correctionSteps.forEach((step) => {
      const timeoutId = setTimeout(() => {
        if (step.text) {
          setInfoText(step.text);
        }
        if (step.reveal) {
          setHasRevealed(true);
        }
      }, step.at * 1000);
      timeoutsRef.current.push(timeoutId);
    });
  };

  const handleRevealOrListen = async () => {
    const sound = soundRef.current;
    if (!sound) return;

    const status = await sound.getStatusAsync();

    if (status.isLoaded && status.isPlaying) {
      // stop
      await sound.stopAsync();
      setIsPlaying(false);
      clearAllTimers();
      return;
    }

    // (Re)lecture
    await sound.setPositionAsync(0);
    await sound.playAsync();
    setIsPlaying(true);

    // Pour la première lecture : on lance l'animation
    if (!hasPlayedOnce) {
      scheduleCorrectionSteps();
      setHasPlayedOnce(true);
    }
  };

  const buttonLabel = hasPlayedOnce ? 'Listen again' : 'Reveal answer';

  // ----- rendu liste joueurs -----

  const renderPlayersList = () => {
    return (
      <View
        style={[
          styles.playersCard,
          { backgroundColor: stageTheme.cardBackground },
        ]}
      >
        {players.map((player, index) => {
          const avatarSource = getAvatarSource(player.avatarId);
          const scoreInfo = scoresByPlayer[player.id];
          const scoreLabel = `+${scoreInfo.score}`;

          return (
            <View key={player.id}>
              <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  {avatarSource ? (
                    <Image source={avatarSource} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  <Text
                    style={[
                      styles.playerName,
                      { color: stageTheme.cardText },
                    ]}
                  >
                    {player.name}
                  </Text>
                </View>

                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: stageTheme.palette[700] },
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreText,
                      { color: stageTheme.cardBackground },
                    ]}
                  >
                    {scoreLabel}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.eyeButton,
                    { backgroundColor: stageTheme.palette[500] },
                  ]}
                  onPress={() => setActivePlayerId(player.id)}
                >
                  <Text style={styles.eyeIcon}>👁️</Text>
                </TouchableOpacity>
              </View>

              {index < players.length - 1 && (
                <View
                  style={[
                    styles.playerSeparator,
                    { backgroundColor: stageTheme.palette[300] },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderPlayerDetail = () => {
    const player = players.find((p) => p.id === activePlayerId);
    if (!player) return null;

    const avatarSource = getAvatarSource(player.avatarId);
    const ans =
      answersByPlayer?.[player.id] || { artist: '', song: '' };
    const scoreInfo = scoresByPlayer[player.id];

    return (
      <View
        style={[
          styles.playersCard,
          { backgroundColor: stageTheme.cardBackground },
        ]}
      >
        <View style={styles.detailHeader}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text
            style={[
              styles.playerName,
              { color: stageTheme.cardText },
            ]}
          >
            {player.name}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailLabel,
              { color: stageTheme.cardText },
            ]}
          >
            Artist :
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: stageTheme.cardText },
            ]}
          >
            {ans.artist || '—'}
          </Text>
        </View>
        <View style={styles.detailResultRow}>
          <Text
            style={[
              styles.detailResultText,
              { color: stageTheme.cardText },
            ]}
          >
            {scoreInfo.artistOk ? '✅ +1' : '❌ +0'}
          </Text>
        </View>

        <View style={{ height: 8 }} />

        <View style={styles.detailRow}>
          <Text
            style={[
              styles.detailLabel,
              { color: stageTheme.cardText },
            ]}
          >
            Song :
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: stageTheme.cardText },
            ]}
          >
            {ans.song || '—'}
          </Text>
        </View>
        <View style={styles.detailResultRow}>
          <Text
            style={[
              styles.detailResultText,
              { color: stageTheme.cardText },
            ]}
          >
            {scoreInfo.songOk ? '✅ +1' : '❌ +0'}
          </Text>
        </View>

        <View style={styles.detailFooter}>
          <Button
            variant="solid"
            tone={tone}
            size="sm"
            title="Back"
            onPress={() => setActivePlayerId(null)}
          />
        </View>
      </View>
    );
  };

  const isInDetailMode = activePlayerId != null;

  return (
    <ScreenContainer
      style={[
        styles.container,
        { backgroundColor: stageTheme.background },
      ]}
    >
      {/* Titre + cover */}
      <Text
        style={[
          theme.typography.headingSm,
          styles.title,
          { color: stageTheme.primaryText },
        ]}
      >
        {topTitle}
      </Text>

      <View style={styles.coverWrapper}>
        {topCoverSource && (
          <Image
            source={topCoverSource}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* zone texte bpm/pitch */}
      <View style={styles.infoZone}>
        <Text
          style={[
            styles.infoText,
            { color: stageTheme.primaryText },
          ]}
        >
          {infoText}
        </Text>
      </View>

      {/* Bouton reveal / listen */}
      <View style={styles.revealButtonWrapper}>
        <Button
          variant="light"
          tone={tone}
          size="sm"
          title={buttonLabel}
          onPress={handleRevealOrListen}
        />
      </View>

      {/* Liste joueurs ou détail joueur */}
      {isInDetailMode ? renderPlayerDetail() : renderPlayersList()}

      {/* Next question */}
      <View style={styles.footer}>
        <Button
          variant="light"
          tone={tone}
          size="lg"
          title="Next question"
          onPress={onNext}
        />
      </View>
    </ScreenContainer>
  );
}

export default CorrectionQuestionScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  coverWrapper: {
    alignItems: 'center',
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  infoZone: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    ...theme.typography.bodyMd,
    textAlign: 'center',
  },
  revealButtonWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  playersCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[200],
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
  playerName: {
    ...theme.typography.bodyMd,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  scoreText: {
    ...theme.typography.bodyMd,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  playerSeparator: {
    height: 2,
    marginVertical: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    ...theme.typography.bodyMd,
    marginRight: 8,
  },
  detailValue: {
    ...theme.typography.bodyMd,
    flexShrink: 1,
  },
  detailResultRow: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  detailResultText: {
    ...theme.typography.bodyMd,
  },
  detailFooter: {
    marginTop: 16,
    alignItems: 'center',
  },
  footer: {
    marginTop: 24,
  },
});
