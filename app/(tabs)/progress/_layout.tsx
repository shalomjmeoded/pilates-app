import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function ProgressStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="weight-history" />
      <Stack.Screen name="physique-assessment" />
      <Stack.Screen name="physique-assessment-capture" />
      <Stack.Screen name="physique-assessment-review" />
    </Stack>
  );
}
