// src/components/ScreenContainer.js

import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Fond plein écran + zone de contenu centrée (500 px max).
 *  - scroll : toute la largeur de l'écran défile (marges comprises, utile
 *    sur desktop), le contenu restant centré. Les autres props sont
 *    transmises au ScrollView (ex. keyboardShouldPersistTaps).
 *  - scrollRef : ref du ScrollView (voir useScrollToEndWhen)
 */
export function ScreenContainer({
  children,
  style,
  contentStyle,
  scroll = false,
  scrollRef,
  ...scrollProps
}) {
  if (scroll) {
    return (
      <ScrollView
        ref={scrollRef}
        style={[styles.outer, style]}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View style={[styles.scrollInner, contentStyle]}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.outer, style]}>
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </View>
  );
}

/**
 * Fait défiler la page jusqu'en bas quand `value` devient non vide
 * (ex. un message d'erreur qui apparaît sous le bouton).
 */
export function useScrollToEndWhen(scrollRef, value) {
  useEffect(() => {
    if (!value) return undefined;
    // On attend que le message soit affiché avant de défiler
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [scrollRef, value]);
}

const styles = StyleSheet.create({
  // "fond" plein écran (couleur, padding, etc. viendront via `style`)
  outer: {
    flex: 1,
  },
  // zone de contenu centrée et limitée en largeur
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollInner: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
});
