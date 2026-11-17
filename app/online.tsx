// app/online.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import OnlineMenuScreen from '@/src/screens/online/OnlineMenuScreen';

const OnlineMenuScreenAny = OnlineMenuScreen as any;

export default function OnlineRoute() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <OnlineMenuScreenAny
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        onEnterRoom={(code: string) => {
          router.replace({ pathname: '/room/[code]', params: { code } });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3576C',
  },
});
