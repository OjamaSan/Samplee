// src/screens/online/RoomScreen.js
//
// Écran unique d'une partie en ligne (/room/CODE). Il suit l'état de la
// partie dans Firebase et affiche la vue correspondant à l'étape en cours :
// tous les appareils changent d'écran en même temps quand l'hôte avance.

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { ProfileForm } from '../../components/ProfileForm';
import { ScreenContainer } from '../../components/ScreenContainer';
import { loadProfile, saveProfile } from '../../online/localProfile';
import { useKeepScreenOn } from '../../online/useKeepScreenOn';
import { OnlinePlayerRow } from '../../components/OnlinePlayerRow';
import {
  computeScores,
  getCorrectionQuestion,
  getCurrentQuestion,
  getPlayerList,
  getStageQuestions,
  joinRoom,
  leaveRoom,
  MAX_PLAYERS,
  playAgain,
  sanitizeName,
  setPhase,
  startCorrection,
  startStage,
  usePresence,
  useRoom,
} from '../../online/roomApi';
import { theme } from '../../theme/theme';
import GameEndScreen from '../GameEndScreen';
import StageEndScreen from '../StageEndScreen';
import StageScoreScreen from '../StageScoreScreen';
import StageSelectScreen from '../StageSelectScreen';
import { OnlineCorrectionView } from './OnlineCorrectionView';
import { LobbyView } from './LobbyView';
import { OnlineQuestionView } from './OnlineQuestionView';

export function RoomScreen({ code, onExit }) {
  const { uid, room, loading, error } = useRoom(code);

  const isMember = !!(uid && room?.players?.[uid]);
  const isHost = !!(uid && room?.hostUid === uid);
  usePresence(code, uid, isMember);
  useKeepScreenOn(isMember);

  const players = useMemo(() => getPlayerList(room), [room]);

  if (loading) {
    return (
      <MessageView>
        <ActivityIndicator color={theme.colors.rouge[100]} size="large" />
      </MessageView>
    );
  }

  if (error) {
    return (
      <MessageView
        title="Connection problem"
        text={error.message}
        onExit={onExit}
      />
    );
  }

  if (!room) {
    return (
      <MessageView
        title="Game not found"
        text={`There is no game with code ${code}. It may have ended.`}
        onExit={onExit}
      />
    );
  }

  // Arrivé par un lien partagé, pas encore inscrit dans la partie
  if (!isMember) {
    if (room.phase !== 'lobby') {
      return (
        <MessageView
          title="Game already started"
          text="You can't join a game in progress. Ask the host to start a new one."
          onExit={onExit}
        />
      );
    }
    if (players.length >= MAX_PLAYERS) {
      return (
        <MessageView
          title="Game full"
          text={`This game already has ${MAX_PLAYERS} players.`}
          onExit={onExit}
        />
      );
    }
    return <JoinView code={code} players={players} onExit={onExit} />;
  }

  const handleLeave = async () => {
    await leaveRoom(code).catch(() => {});
    onExit?.();
  };

  switch (room.phase) {
    case 'lobby':
      return (
        <LobbyView
          code={code}
          uid={uid}
          isHost={isHost}
          players={players}
          onStart={() => setPhase(code, 'stageSelect')}
          onLeave={handleLeave}
        />
      );

    case 'stageSelect':
      if (isHost) {
        return (
          <StageSelectScreen
            onBack={() => setPhase(code, 'lobby')}
            isStagePlayable={(stageId) => getStageQuestions(stageId).length > 0}
            onPlay={(stage) => startStage(code, stage.id)}
          />
        );
      }
      return (
        <WaitingView
          title="The host is choosing a stage…"
          players={players}
          uid={uid}
        />
      );

    case 'question': {
      const question = getCurrentQuestion(room);
      if (!question) {
        return <MessageView title="Unknown question" onExit={onExit} />;
      }
      return (
        <OnlineQuestionView
          // Nouvel écran (réponse vide, audio arrêté) à chaque question
          key={room.questionId}
          code={code}
          room={room}
          uid={uid}
          isHost={isHost}
          players={players}
          question={question}
        />
      );
    }

    case 'stageEnd':
      return (
        <StageEndScreen
          stageId={room.stageId}
          onSeeAnswers={isHost ? () => startCorrection(code) : undefined}
        />
      );

    case 'correction': {
      const question = getCorrectionQuestion(room);
      if (!question) {
        return <MessageView title="Unknown question" onExit={onExit} />;
      }
      return (
        <OnlineCorrectionView
          // Nouvel écran (audio arrêté) à chaque question corrigée
          key={question.id}
          code={code}
          room={room}
          uid={uid}
          isHost={isHost}
          players={players}
          question={question}
        />
      );
    }

    case 'stageScore':
      return (
        <StageScoreScreen
          stageId={room.stageId}
          players={players}
          scores={computeScores(room, players, room.stageId)}
          onNextStage={isHost ? () => setPhase(code, 'stageSelect') : undefined}
          onEndGame={isHost ? () => setPhase(code, 'gameEnd') : undefined}
        />
      );

    case 'gameEnd':
      return (
        <GameEndScreen
          players={players}
          scores={computeScores(room, players)}
          onPlayAgain={isHost ? () => playAgain(code) : undefined}
          onBackToMenu={handleLeave}
        />
      );

    default:
      return (
        <MessageView
          title="Something went wrong"
          text="This game is in an unknown state."
          onExit={onExit}
        />
      );
  }
}

export default RoomScreen;

// ---------- Rejoindre via un lien ----------

function JoinView({ code, players, onExit }) {
  const [profile, setProfile] = useState(() => loadProfile());
  const [busy, setBusy] = useState(false);
  const [joinError, setJoinError] = useState('');

  const takenAvatarIds = players.map((p) => p.avatarId);
  const hasName = sanitizeName(profile.name).length > 0;

  const handleJoin = async () => {
    setBusy(true);
    setJoinError('');
    try {
      saveProfile(profile);
      await joinRoom(code, profile);
      // Pas de navigation : l'écran se met à jour tout seul dès que
      // Firebase confirme l'inscription.
    } catch (err) {
      setJoinError(err?.message || 'Could not join the game.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.backButtonWrapper}>
            <Button
              variant="light"
              tone="rouge"
              size="sm"
              title="Back"
              onPress={onExit}
            />
          </View>
        </View>

        <Text style={[theme.typography.headingLg, styles.title]}>
          Join game {code}
        </Text>

        <ProfileForm
          profile={profile}
          onChange={setProfile}
          takenAvatarIds={takenAvatarIds}
        />

        <View style={styles.footer}>
          <Button
            title="Join"
            variant="solid"
            tone="green"
            size="lg"
            onPress={handleJoin}
            disabled={!hasName || busy}
          />
        </View>

        {!!joinError && <Text style={styles.errorText}>{joinError}</Text>}
      </ScrollView>
    </ScreenContainer>
  );
}

// ---------- Attente (les autres joueurs pendant que l'hôte choisit) ----------

function WaitingView({ title, players, uid }) {
  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[theme.typography.headingMd, styles.waitingTitle]}>
          {title}
        </Text>
        <ActivityIndicator color={theme.colors.rouge[100]} />
        <View style={styles.waitingCard}>
          {players.map((player, index) => (
            <View key={player.id}>
              <OnlinePlayerRow player={player} isMe={player.id === uid} />
              {index < players.length - 1 && (
                <View style={styles.waitingSeparator} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ---------- Message plein écran ----------

function MessageView({ title, text, onExit, children }) {
  return (
    <ScreenContainer style={[styles.container, styles.centered]}>
      <View style={styles.messageContent}>
        {title && (
          <Text style={[theme.typography.headingMd, styles.messageTitle]}>
            {title}
          </Text>
        )}
        {text && <Text style={styles.messageText}>{text}</Text>}
        {children}
        {onExit && (
          <View style={styles.messageButton}>
            <Button
              title="Back to menu"
              variant="light"
              tone="rouge"
              size="sm"
              onPress={onExit}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.rouge[500],
  },
  centered: {
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerRow: {
    marginBottom: 16,
  },
  backButtonWrapper: {
    width: 120,
    alignSelf: 'flex-start',
  },
  title: {
    color: theme.colors.rouge[100],
    marginBottom: 24,
  },
  footer: {
    marginTop: 24,
  },
  errorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[100],
    backgroundColor: theme.colors.rouge[700],
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageTitle: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginBottom: 12,
  },
  messageText: {
    ...theme.typography.bodyMd,
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginBottom: 16,
  },
  waitingTitle: {
    color: theme.colors.rouge[100],
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 16,
  },
  waitingCard: {
    backgroundColor: theme.colors.rouge[100],
    borderRadius: 16,
    padding: 16,
    marginTop: 32,
  },
  waitingSeparator: {
    height: 2,
    backgroundColor: theme.colors.rouge[300],
    marginVertical: 12,
  },
  messageButton: {
    width: 200,
    marginTop: 16,
  },
});
