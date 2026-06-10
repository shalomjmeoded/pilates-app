import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary },
        presentation: 'modal',
      }}
    />
  );
}
