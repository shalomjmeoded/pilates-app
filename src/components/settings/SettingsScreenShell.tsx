import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

interface SettingsScreenShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SettingsScreenShell({ title, subtitle, children }: SettingsScreenShellProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="bodyMuted" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          ← Settings
        </Text>
        <Text variant="h1">{title}</Text>
        {subtitle ? <Text variant="bodyMuted">{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  back: {
    alignSelf: 'flex-start',
  },
  body: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
