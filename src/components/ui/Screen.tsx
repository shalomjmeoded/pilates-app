import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  loadingLabel?: string;
}

export function Screen({
  children,
  title,
  subtitle,
  isLoading = false,
  loadingLabel = 'Loading...',
}: ScreenProps) {
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.brandPrimary} />
          <Text variant="bodyMuted" style={styles.loadingText}>
            {loadingLabel}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {title || subtitle ? (
          <View style={styles.header}>
            {title ? <Text variant="h1" style={styles.title}>{title}</Text> : null}
            {subtitle ? (
              <Text variant="bodyMuted" style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  title: {
    color: colors.textStrong,
  },
  subtitle: {
    marginBottom: spacing.xs,
    maxWidth: 560,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    marginTop: spacing.xs,
  },
});
