// app/room/[code].tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import RoomScreen from '@/src/screens/online/RoomScreen';
import { normalizeCode } from '@/src/online/roomApi';

const RoomScreenAny = RoomScreen as any;

export default function RoomRoute() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = normalizeCode(params.code);

  return (
    <SafeAreaView style={styles.safeArea}>
      <RoomScreenAny
        // On repart de zéro si le code change (nouvelle partie)
        key={code}
        code={code}
        onExit={() => router.replace('/')}
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
