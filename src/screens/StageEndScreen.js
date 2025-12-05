// src/screens/StageEndScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { Button } from '@/src/components/Button';
import { theme } from '@/src/theme/theme';
import { STAGES } from '@/src/data/stages';
import { getStageTheme } from '@/src/theme/stageTheme';

export function StageEndScreen({ stageId, onSeeAnswers }) {
  const stage = STAGES.find((s) => s.id === stageId);

  const stageLabel = stage
    ? `${stage.title}\n(${stage.periodLabel})`
    : 'this stage';

  const stageTheme = getStageTheme(stageId);
  const tone = stageTheme.family;

  return (
    <ScreenContainer
      style={[
        styles.container,
        { backgroundColor: stageTheme.background },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            theme.typography.headingSm,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          You have
        </Text>
        <Text
          style={[
            theme.typography.headingSm,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          completed the
        </Text>
        <Text
          style={[
            theme.typography.headingSm,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          {stageLabel}
        </Text>
        <Text
          style={[
            theme.typography.headingSm,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          stage !
        </Text>

        <View style={styles.spacer} />

        <Text
          style={[
            theme.typography.bodyMd,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          Click the button
        </Text>
        <Text
          style={[
            theme.typography.bodyMd,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          below to start
        </Text>
        <Text
          style={[
            theme.typography.bodyMd,
            styles.text,
            { color: stageTheme.primaryText },
          ]}
        >
          correction.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          variant="light"
          tone={tone}
          size="lg"
          title="See answers"
          onPress={onSeeAnswers}
        />
      </View>
    </ScreenContainer>
  );
}

export default StageEndScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: 4,
  },
  spacer: {
    height: 24,
  },
  footer: {
    alignItems: 'center',
  },
});
