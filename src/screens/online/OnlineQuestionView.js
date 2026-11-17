// src/screens/online/OnlineQuestionView.js
//
// Une question en mode en ligne. Chaque joueur répond sur son appareil ;
// seul l'hôte joue l'extrait (tout le monde est dans la même pièce) et
// passe à la question suivante.

import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { OnlinePlayerRow } from '../../components/OnlinePlayerRow';
import { ScreenContainer } from '../../components/ScreenContainer';
import {
  getCurrentAnswers,
  getStageQuestions,
  goToNextQuestion,
  submitAnswer,
} from '../../online/roomApi';
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

  const answeredCount = players.filter((p) => answers[p.id]).length;
  const allAnswered = answeredCount === players.length;
  const missingCount = players.length - answeredCount;

  // ------- Réponse du joueur -------
  const [editing, setEditing] = useState(!myAnswer);
  const [draft, setDraft] = useState({
    artist: myAnswer?.artist ?? '',
    song: myAnswer?.song ?? '',
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const send = async (answer) => {
    setSending(true);
    setSendError('');
    try {
      await submitAnswer(code, room, answer);
      setEditing(false);
    } catch {
      // Le plus souvent : l'hôte est passé à la question suivante entre-temps
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
  };

  // ------- Passage à la suite (hôte) -------
  const [advancing, setAdvancing] = useState(false);
  const handleNext = async () => {
    setAdvancing(true);
    try {
      await goToNextQuestion(code, room);
    } finally {
      setAdvancing(false);
    }
  };

  const nextLabel = isLastQuestion ? 'Finish stage' : 'Next question';

  return (
    <ScreenContainer style={{ backgroundColor: stageTheme.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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

        {isHost ? (
          <HostSamplePlayer question={question} tone={tone} />
        ) : (
          <Text style={[styles.listenHint, { color: stageTheme.primaryText }]}>
            🔊 Listen to the sample on the host&apos;s device
          </Text>
        )}

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
                {myAnswer && (
                  <Button
                    variant="light"
                    tone={tone}
                    size="sm"
                    title="Cancel"
                    style={styles.inputFooterButton}
                    onPress={() => setEditing(false)}
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
                    {answers[player.id] ? '✓' : '…'}
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
              <Button
                variant="light"
                tone={tone}
                size="lg"
                title={nextLabel}
                onPress={handleNext}
                disabled={!allAnswered || advancing}
              />
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
      </ScrollView>
    </ScreenContainer>
  );
}

export default OnlineQuestionView;

function formatAnswer(answer) {
  if (!answer || (!answer.artist && !answer.song)) return "I don't know";
  return [answer.artist, answer.song].filter(Boolean).join(' – ');
}

// L'extrait n'est joué que sur l'appareil de l'hôte.
function HostSamplePlayer({ question, tone }) {
  const audio = useAudioPlayer(question.audioSource ?? null);
  const status = useAudioPlayerStatus(audio);

  const handlePress = () => {
    if (!status.isLoaded) return;
    if (status.playing) {
      audio.pause();
    } else {
      audio.seekTo(0);
      audio.play();
    }
  };

  return (
    <View style={styles.playButton}>
      <Button
        variant="light"
        tone={tone}
        size="sm"
        title={status.playing ? 'Stop sample' : 'Play sample'}
        onPress={handlePress}
      />
    </View>
  );
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
    width: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
  listenHint: {
    ...theme.typography.bodyMd,
    textAlign: 'center',
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
