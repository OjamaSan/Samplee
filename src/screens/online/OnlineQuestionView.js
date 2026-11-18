// src/screens/online/OnlineQuestionView.js
//
// Une question en mode en ligne. Chaque joueur répond sur son appareil ;
// seul l'hôte joue l'extrait (tout le monde est dans la même pièce) et
// passe à la question suivante.

import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { OnlinePlayerRow } from '../../components/OnlinePlayerRow';
import { SamplePlayButton } from '../../components/SamplePlayButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import {
  getCurrentAnswers,
  getStageQuestions,
  goToNextQuestion,
  goToPreviousQuestion,
  isAnswerFinal,
  startEditingAnswer,
  submitAnswer,
} from '../../online/roomApi';
import { useOnlinePlayback } from '../../online/useOnlinePlayback';
import { useSamplePlayer } from '../../lib/samplePlayback';
import { getStageTheme } from '../../theme/stageTheme';
import { theme } from '../../theme/theme';

export function OnlineQuestionView({ code, room, uid, isHost, players, question }) {
  const stageTheme = getStageTheme(question.stageId);
  const tone = stageTheme.family;

  const questions = getStageQuestions(room.stageId);
  const questionNumber = (room.questionIndex ?? 0) + 1;
  const isLastQuestion = questionNumber >= questions.length;

  const answers = getCurrentAnswers(room);
  const myAnswer = answers[uid] ?? null;

  // Une réponse en cours de modification ne compte pas comme donnée
  const answeredCount = players.filter((p) => isAnswerFinal(answers[p.id])).length;
  // Les joueurs hors ligne ne bloquent pas la suite : on n'attend que
  // ceux qui sont connectés.
  const missingCount = players.filter(
    (p) => p.isConnected && !isAnswerFinal(answers[p.id])
  ).length;
  const allAnswered = missingCount === 0;

  // ------- Extrait : joué chez l'hôte, progression affichée partout -------
  const sample = useSamplePlayer(isHost ? question.audioSource : null);
  const playback = useOnlinePlayback({
    code,
    room,
    isHost,
    kind: 'sample',
    questionId: question.id,
    player: sample,
  });

  // ------- Réponse du joueur -------
  const [editing, setEditing] = useState(!isAnswerFinal(myAnswer));
  // "Cancel" n'a de sens que si on modifie une réponse déjà envoyée
  // (pas pendant l'envoi de la première).
  const [canCancel, setCanCancel] = useState(!!myAnswer);
  const [draft, setDraft] = useState({
    artist: myAnswer?.artist ?? '',
    song: myAnswer?.song ?? '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const send = async (answer) => {
    setSending(true);
    setSendError('');
    // On referme le formulaire tout de suite (sans attendre la confirmation
    // du serveur) pour éviter un affichage intermédiaire.
    setEditing(false);
    try {
      await submitAnswer(code, room, answer);
    } catch {
      // Le plus souvent : l'hôte est passé à la question suivante entre-temps
      setEditing(true);
      setSendError('Your answer could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = () => {
    const artist = draft.artist.trim();
    const song = draft.song.trim();
    if (!artist && !song) return;
    send({ artist, song });
  };

  const handleDontKnow = () => {
    setDraft({ artist: '', song: '' });
    send({ artist: '', song: '' });
  };

  const handleChange = () => {
    setDraft({ artist: myAnswer?.artist ?? '', song: myAnswer?.song ?? '' });
    setEditing(true);
    setCanCancel(true);
    // Prévient l'hôte : il devra attendre que la réponse soit renvoyée
    startEditingAnswer(code, room, myAnswer).catch(() => {});
  };

  // Annuler la modification = renvoyer la réponse précédente telle quelle
  const handleCancelEdit = () => {
    send({ artist: myAnswer?.artist ?? '', song: myAnswer?.song ?? '' });
  };

  // ------- Passage à la suite (hôte) -------
  const [advancing, setAdvancing] = useState(false);
  const handleNext = async () => {
    setAdvancing(true);
    sample.stop();
    try {
      await goToNextQuestion(code, room);
    } finally {
      setAdvancing(false);
    }
  };

  const handlePrevious = async () => {
    setAdvancing(true);
    sample.stop();
    try {
      await goToPreviousQuestion(code, room);
    } finally {
      setAdvancing(false);
    }
  };

  const isFirstQuestion = questionNumber <= 1;
  const nextLabel = isLastQuestion ? 'Finish stage' : 'Next question';

  return (
    <ScreenContainer
      scroll
      style={{ backgroundColor: stageTheme.background }}
      contentStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
        <Text style={[styles.progress, { color: stageTheme.primaryText }]}>
          Question {questionNumber}/{questions.length}
        </Text>

        {/* Sample original */}
        <Text
          style={[
            theme.typography.headingSm,
            styles.centerText,
            { color: stageTheme.primaryText },
          ]}
        >
          {question.title}
        </Text>

        <View style={styles.coverWrapper}>
          {question.coverSource && (
            <Image
              source={question.coverSource}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}
        </View>

        <SamplePlayButton
          tone={tone}
          label={isHost ? 'Play sample' : 'Waiting host'}
          isPlaying={playback.isPlaying}
          progress={playback.progress}
          onPlay={isHost ? sample.play : undefined}
          onStop={isHost ? sample.stop : undefined}
          style={styles.playButton}
        />

        <Text
          style={[
            theme.typography.headingSm,
            styles.centerText,
            styles.questionText,
            { color: stageTheme.primaryText },
          ]}
        >
          What song uses this sample ?
        </Text>

        {/* Ma réponse */}
        <View style={[styles.card, { backgroundColor: stageTheme.cardBackground }]}>
          {editing ? (
            <>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: stageTheme.palette[500],
                    color: stageTheme.cardText,
                  },
                ]}
                placeholder="Artist name"
                placeholderTextColor={stageTheme.palette[700]}
                value={draft.artist}
                onChangeText={(artist) => setDraft((d) => ({ ...d, artist }))}
                autoCorrect={false}
              />
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: stageTheme.palette[500],
                    color: stageTheme.cardText,
                  },
                ]}
                placeholder="Song name"
                placeholderTextColor={stageTheme.palette[700]}
                value={draft.song}
                onChangeText={(song) => setDraft((d) => ({ ...d, song }))}
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
              />
              <View style={styles.inputFooter}>
                {canCancel && (
                  <Button
                    variant="light"
                    tone={tone}
                    size="sm"
                    title="Cancel"
                    style={styles.inputFooterButton}
                    onPress={handleCancelEdit}
                    disabled={sending}
                  />
                )}
                <Button
                  variant="light"
                  tone={tone}
                  size="sm"
                  title="I don't know"
                  style={styles.inputFooterButton}
                  onPress={handleDontKnow}
                  disabled={sending}
                />
                <Button
                  variant="solid"
                  tone={tone}
                  size="sm"
                  title="Submit"
                  style={styles.inputFooterButton}
                  onPress={handleSubmit}
                  disabled={sending || (!draft.artist.trim() && !draft.song.trim())}
                />
              </View>
              {!!sendError && (
                <Text style={[styles.errorText, { color: stageTheme.cardText }]}>
                  {sendError}
                </Text>
              )}
            </>
          ) : (
            <View style={styles.sentRow}>
              <View style={styles.sentTexts}>
                <Text style={[styles.sentTitle, { color: stageTheme.cardText }]}>
                  ✓ Answer sent
                </Text>
                <Text
                  style={[styles.sentDetail, { color: stageTheme.cardText }]}
                  numberOfLines={2}
                >
                  {formatAnswer(myAnswer)}
                </Text>
              </View>
              <View style={styles.changeButton}>
                <Button
                  variant="solid"
                  tone={tone}
                  size="sm"
                  title="Change"
                  onPress={handleChange}
                />
              </View>
            </View>
          )}
        </View>

        {/* Qui a répondu */}
        <View style={[styles.card, { backgroundColor: stageTheme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: stageTheme.cardText }]}>
            Answers {answeredCount}/{players.length}
          </Text>
          {players.map((player, index) => (
            <View key={player.id}>
              <OnlinePlayerRow
                player={player}
                isMe={player.id === uid}
                textColor={stageTheme.cardText}
                right={
                  <Text style={[styles.statusText, { color: stageTheme.cardText }]}>
                    {isAnswerFinal(answers[player.id])
                      ? '✓'
                      : player.isConnected
                        ? '…'
                        : '–'}
                  </Text>
                }
              />
              {index < players.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: stageTheme.palette[300] },
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Suite */}
        <View style={styles.footer}>
          {isHost ? (
            <>
              <View style={styles.navRow}>
                <Button
                  variant="light"
                  tone={tone}
                  size="lg"
                  icon={<Text style={[styles.navIcon, { color: stageTheme.palette[700] }]}>◀</Text>}
                  onPress={handlePrevious}
                  disabled={isFirstQuestion || advancing}
                  style={styles.prevButton}
                />
                <Button
                  variant="light"
                  tone={tone}
                  size="lg"
                  title={nextLabel}
                  onPress={handleNext}
                  disabled={!allAnswered || advancing}
                  style={styles.nextButton}
                />
              </View>
              {!allAnswered && (
                <>
                  <Text style={[styles.hintText, { color: stageTheme.primaryText }]}>
                    {missingCount === 1
                      ? '1 player has not answered yet.'
                      : `${missingCount} players have not answered yet.`}
                  </Text>
                  <View style={styles.skipButton}>
                    <Button
                      variant="solid"
                      tone={tone}
                      size="sm"
                      title="Continue anyway"
                      onPress={handleNext}
                      disabled={advancing}
                    />
                  </View>
                </>
              )}
            </>
          ) : (
            <Text style={[styles.hintText, { color: stageTheme.primaryText }]}>
              {allAnswered
                ? 'Everyone has answered! Waiting for the host…'
                : 'You can change your answer until the host moves on.'}
            </Text>
          )}
        </View>
    </ScreenContainer>
  );
}

export default OnlineQuestionView;

function formatAnswer(answer) {
  if (!answer || (!answer.artist && !answer.song)) return "I don't know";
  return [answer.artist, answer.song].filter(Boolean).join(' – ');
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  progress: {
    ...theme.typography.bodySmCondensed,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.85,
  },
  centerText: {
    textAlign: 'center',
  },
  coverWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  coverImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
  playButton: {
    marginBottom: 16,
  },
  questionText: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    ...theme.typography.bodyMd,
    marginBottom: 12,
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    marginBottom: 12,
    minWidth: 0,
    ...theme.typography.bodyMd,
  },
  inputFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  inputFooterButton: {
    flex: 1,
  },
  errorText: {
    ...theme.typography.bodySmCondensed,
    marginTop: 8,
    textAlign: 'center',
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentTexts: {
    flex: 1,
    marginRight: 12,
  },
  sentTitle: {
    ...theme.typography.headingSm,
  },
  sentDetail: {
    ...theme.typography.bodyMd,
  },
  changeButton: {
    width: 110,
  },
  statusText: {
    ...theme.typography.headingSm,
    width: 32,
    textAlign: 'center',
  },
  separator: {
    height: 2,
    marginVertical: 12,
  },
  footer: {
    marginTop: 8,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  prevButton: {
    width: 75,
  },
  nextButton: {
    flex: 1,
  },
  navIcon: {
    ...theme.typography.headingSm,
  },
  hintText: {
    ...theme.typography.bodyMd,
    textAlign: 'center',
    marginTop: 8,
  },
  skipButton: {
    width: 200,
    alignSelf: 'center',
    marginTop: 8,
  },
});
