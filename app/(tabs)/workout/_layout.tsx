import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function WorkoutStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="player/[sessionId]"
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="feedback/[sessionId]" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
