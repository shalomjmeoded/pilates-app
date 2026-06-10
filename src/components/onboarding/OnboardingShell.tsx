import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';
import { colors, spacing } from '@/theme';

interface OnboardingShellProps {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  hideFooter?: boolean;
}

export function OnboardingShell({
  step,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  showBack = true,
  hideFooter = false,
}: OnboardingShellProps) {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="label">
          {step} / {ONBOARDING_TOTAL_STEPS}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / ONBOARDING_TOTAL_STEPS) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInRight.duration(280)}
          exiting={FadeOutLeft.duration(200)}
          style={[styles.page, isCompact && styles.pageCompact]}
        >
          <View style={styles.intro}>
            <Text variant="h1" style={styles.title} numberOfLines={3}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyMuted" style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </ScrollView>

      {!hideFooter ? (
        <View style={styles.footer}>
          {showBack && onBack ? (
            <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
              <Text variant="body" style={styles.backLabel}>
                Back
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backSpacer} />
          )}
          {onNext ? (
            <View style={styles.nextWrap}>
              <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} />
            </View>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  page: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  pageCompact: {
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  intro: {
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
    paddingRight: spacing.xs,
  },
  subtitle: {
    maxWidth: 560,
  },
  body: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundPrimary,
  },
  backButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  backLabel: {
    color: colors.brandPrimary,
  },
  backSpacer: {
    width: 64,
  },
  nextWrap: {
    flex: 1,
  },
});
