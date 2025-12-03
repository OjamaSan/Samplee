// src/components/ScreenContainer.js

import React from 'react';
import { View, StyleSheet } from 'react-native';

export function ScreenContainer({ children, style, contentStyle }) {
  return (
    <View style={[styles.outer, style]}>
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // "fond" plein écran (couleur, padding, etc. viendront via `style`)
  outer: {
    flex: 1,
    alignItems: 'stretch',
  },
  // zone de contenu centrée et limitée en largeur
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
});
