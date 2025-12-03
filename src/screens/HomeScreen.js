// src/screens/HomeScreen.js

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { theme } from '../theme/theme';
import { Button } from '../components/Button';
import { ScreenContainer } from '../components/ScreenContainer';

export function HomeScreen({ onNewGame }) {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        {/* Logo "S" */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/logo-samplejam.png')}
            style={styles.logoImage}
          />
        </View>

        {/* Colonne de boutons */}
        <View style={styles.buttonsColumn}>
          <Button
            title="New game"
            variant="light"
            tone="rouge"
            size="lg"
            onPress={onNewGame}
          />
          <Button
            title="How to play ?"
            variant="light"
            tone="rouge"
            size="lg"
            onPress={() => {}}
          />
          <Button
            title="FAQ"
            variant="light"
            tone="rouge"
            size="lg"
            onPress={() => {}}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // fond de la page
  container: {
    flex: 1,
    backgroundColor: theme.app.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  // contenu centré dans la zone maxWidth=500 (gérée par ScreenContainer)
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 40,
  },
  logoImage: {
    width: 153,
    height: 236,
    resizeMode: 'contain',
  },
  buttonsColumn: {
    alignSelf: 'stretch',
    gap: 16,
  },
});
