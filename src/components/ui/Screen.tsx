import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { BetterMeBrandMark } from '@/components/ui/BetterMeBrandMark';
import { colors, spacing, createDynamicStyles } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  showBrandMark?: boolean;
}

export function Screen({
  children,
  title,
  subtitle,
  isLoading = false,
  loadingLabel = 'Loading...',
  showBrandMark = false,
}: ScreenProps) {
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          {showBrandMark ? <BetterMeBrandMark compact /> : null}
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
            {title ? (
              <View style={styles.titleRow}>
                <Text variant="h1" style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {title}
                </Text>
                {showBrandMark ? <BetterMeBrandMark compact showDescriptor /> : null}
              </View>
            ) : null}
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

const styles = createDynamicStyles(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
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
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xs,
    maxWidth: 560,
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  loadingText: {
    marginTop: spacing.xs,
  },
}));
