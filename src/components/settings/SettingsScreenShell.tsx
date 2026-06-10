import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

interface SettingsScreenShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  hasUnsavedChanges?: boolean;
  onBackPress?: () => void;
}

export function SettingsScreenShell({
  title,
  subtitle,
  children,
  hasUnsavedChanges = false,
  onBackPress,
}: SettingsScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar hasUnsavedChanges={hasUnsavedChanges} onPress={onBackPress} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  body: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
