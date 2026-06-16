import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="nutrition" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="units" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="data" />
      <Stack.Screen name="about" />
      <Stack.Screen name="plan-updated" />
      <Stack.Screen name="rebuild-plan" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="plan-assumptions" />
    </Stack>
  );
}
