// src/screens/SampleQuestionScreen.js

import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/theme/theme';
import { usePlayers } from '@/src/context/PlayersContext';
import { AVATARS } from '@/src/data/avatars';
import { getStageTheme } from '@/src/theme/stageTheme';

// utilitaire : retrouver la source d'un avatar à partir de son id
function getAvatarSource(avatarId) {
  if (!avatarId) return null;
  const avatar = AVATARS.find((a) => a.id === avatarId);
  return avatar?.source ?? null;
}

/**
 * Props attendues :
 * - question: {
 *     id: string,
 *     stageId: string,
 *     title: string,
 *     coverSource: ImageSource,
 *     audioSource: any,
 *   }
 * - onNext: ({ questionId, answersByPlayer }) => void
 */
export function SampleQuestionScreen({ question, onNext }) {
  const { players } = usePlayers();

  // ------- THEME DU STAGE -------
  const stageTheme = getStageTheme(question.stageId);
  const tone = stageTheme.family; // 'turquoise', 'blue', etc.

  // ------- AUDIO : play / stop / replay -------
  // Le player est créé / libéré automatiquement avec l'écran (expo-audio).
  const audio = useAudioPlayer(question.audioSource ?? null);
  const status = useAudioPlayerStatus(audio);
  const isPlaying = status.playing;

  const handlePlaySample = () => {
    if (!status.isLoaded) return;
    if (status.playing) {
      // Si ça joue déjà → stop
      audio.pause();
    } else {
      // Relance depuis le début
      audio.seekTo(0);
      audio.play();
    }
  };

  // ------- GESTION DES REPONSES PAR JOUEUR -------

  // Structure : { [playerId]: { artist: string, song: string, hasSubmitted: boolean } }
  const [answersByPlayer, setAnswersByPlayer] = useState({});

  // Joueur actuellement en mode "input"
  const [activePlayerId, setActivePlayerId] = useState(null);

  // Brouillon de la saisie en cours : n'est validé qu'au Submit,
  // ce qui permet d'annuler sans écraser une réponse déjà donnée.
  const [draft, setDraft] = useState({ artist: '', song: '' });

  const openPlayerInput = (playerId) => {
    const current = answersByPlayer[playerId];
    setDraft({ artist: current?.artist ?? '', song: current?.song ?? '' });
    setActivePlayerId(playerId);
  };

  // À chaque changement de question, on :
  // - remet activePlayerId à null (retour en mode liste)
  // - réinitialise les réponses pour tous les joueurs
  useEffect(() => {
    const initial = {};
    players.forEach((p) => {
      initial[p.id] = {
        artist: '',
        song: '',
        hasSubmitted: false,
      };
    });
    setAnswersByPlayer(initial);
    setActivePlayerId(null);
  }, [question?.id, players]);

  const allAnswered = useMemo(
    () =>
      players.every(
        (p) => answersByPlayer[p.id] && answersByPlayer[p.id].hasSubmitted
      ),
    [players, answersByPlayer]
  );

  const commitAnswer = (playerId, artist, song) => {
    setAnswersByPlayer((prev) => ({
      ...prev,
      [playerId]: { artist, song, hasSubmitted: true },
    }));
    setActivePlayerId(null);
  };

  const handleSubmitAnswer = (playerId) => {
    const artist = draft.artist.trim();
    const song = draft.song.trim();
    // Au moins un des deux champs : on peut connaître l'artiste sans le titre
    if (!artist && !song) return;
    commitAnswer(playerId, artist, song);
  };

  // "I don't know" : réponse vide, 0 point, mais le joueur est compté comme ayant répondu
  const handleSkipAnswer = (playerId) => {
    commitAnswer(playerId, '', '');
  };

  const handleNextQuestion = () => {
    if (!allAnswered) return;
    onNext?.({ questionId: question.id, answersByPlayer });
  };

  // ------- RENDU DES BLOCS JOUEURS -------

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
          const answerState = answersByPlayer[player.id] || {
            hasSubmitted: false,
          };
          const hasAnswer = answerState.hasSubmitted;

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

                <View style={styles.playerAction}>
                  <Button
                    variant="solid"
                    tone={tone}
                    size="sm"
                    title={hasAnswer ? 'Change' : 'Answer'}
                    onPress={() => openPlayerInput(player.id)}
                  />
                </View>
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

  const renderPlayerInput = () => {
    const player = players.find((p) => p.id === activePlayerId);
    if (!player) return null;

    const avatarSource = getAvatarSource(player.avatarId);
    const answerState = answersByPlayer[player.id];

    const updateField = (field, value) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
    };

    return (
      <View
        style={[
          styles.playersCard,
          { backgroundColor: stageTheme.cardBackground },
        ]}
      >
        <View style={styles.inputHeader}>
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

        <View style={styles.inputFields}>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: stageTheme.palette[500],
                backgroundColor: stageTheme.cardBackground,
                color: stageTheme.cardText,
              },
            ]}
            placeholder="Artist name"
            placeholderTextColor={stageTheme.palette[700]}
            value={draft.artist}
            onChangeText={(text) => updateField('artist', text)}
            // on masque le texte s'il a déjà soumis une réponse
            secureTextEntry={answerState?.hasSubmitted}
          />
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: stageTheme.palette[500],
                backgroundColor: stageTheme.cardBackground,
                color: stageTheme.cardText,
              },
            ]}
            placeholder="Song name"
            placeholderTextColor={stageTheme.palette[700]}
            value={draft.song}
            onChangeText={(text) => updateField('song', text)}
            secureTextEntry={answerState?.hasSubmitted}
          />
        </View>

        <View style={styles.inputFooter}>
          <Button
            variant="light"
            tone={tone}
            size="sm"
            title="Cancel"
            style={styles.inputFooterButton}
            onPress={() => setActivePlayerId(null)}
          />
          <Button
            variant="light"
            tone={tone}
            size="sm"
            title="I don't know"
            style={styles.inputFooterButton}
            onPress={() => handleSkipAnswer(player.id)}
          />
          <Button
            variant="solid"
            tone={tone}
            size="sm"
            title="Submit"
            style={styles.inputFooterButton}
            onPress={() => handleSubmitAnswer(player.id)}
            disabled={!draft.artist.trim() && !draft.song.trim()}
          />
        </View>
      </View>
    );
  };

  const isInInputMode = activePlayerId != null;

  return (
    <ScreenContainer
      style={[
        styles.container,
        { backgroundColor: stageTheme.background },
      ]}
    >
      {/* Titre du sample original */}
      <Text
        style={[
          theme.typography.headingSm,
          styles.sampleTitle,
          { color: stageTheme.primaryText },
        ]}
      >
        {question.title}
      </Text>

      {/* Cover */}
      <View style={styles.coverWrapper}>
        {question.coverSource && (
          <Image
            source={question.coverSource}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Bouton Play sample */}
      <View style={styles.playButtonWrapper}>
        <Button
          variant="light"
          tone={tone}
          size="sm"
          title={isPlaying ? 'Stop sample' : 'Play sample'}
          onPress={handlePlaySample}
          style={styles.playButton}
        />
      </View>

      {/* Question */}
      <Text
        style={[
          theme.typography.headingSm,
          styles.questionText,
          { color: stageTheme.primaryText },
        ]}
      >
        What song uses this sample ?
      </Text>

      {/* Bloc joueurs OU bloc input joueur */}
      {isInInputMode ? renderPlayerInput() : renderPlayersList()}

      {/* Bouton Next question */}
      <View style={styles.footer}>
        <Button
          variant="light"
          tone={tone}
          size="lg"
          title="Next question"
          onPress={handleNextQuestion}
          disabled={!allAnswered}
        />
      </View>
    </ScreenContainer>
  );
}

export default SampleQuestionScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  sampleTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  playButtonWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  playButton: {
    width: 200,
    alignSelf: 'center',
  },
    questionText: {
    textAlign: 'center',
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
    justifyContent: 'space-between',
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
  playerAction: {
    marginLeft: 12,
    width: 90,
  },
  playerSeparator: {
    height: 2,
    marginVertical: 12,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputFields: {
    gap: 12,
    marginBottom: 16,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    ...theme.typography.bodyMd,
  },
  inputFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  inputFooterButton: {
    flex: 1,
  },
  footer: {
    marginTop: 24,
  },
});
