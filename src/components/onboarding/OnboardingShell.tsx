import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
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
  nextDisabledReason?: string;
  showBack?: boolean;
  hideFooter?: boolean;
  hideStepIndicator?: boolean;
  titleLines?: number;
  scrollEnabled?: boolean;
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
  nextDisabledReason,
  showBack = true,
  hideFooter = false,
  hideStepIndicator = false,
  titleLines = 3,
  scrollEnabled = true,
}: OnboardingShellProps) {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {showBack && onBack ? <SubscreenTopBar onPress={onBack} /> : null}
      {!hideStepIndicator ? (
        <View style={styles.header}>
          <Text variant="label">
            {step} / {ONBOARDING_TOTAL_STEPS}
          </Text>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Onboarding progress"
            accessibilityValue={{ min: 0, max: ONBOARDING_TOTAL_STEPS, now: step }}
            style={styles.progressTrack}
          >
            <View style={[styles.progressFill, { width: `${(step / ONBOARDING_TOTAL_STEPS) * 100}%` }]} />
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInRight.duration(280)}
          exiting={FadeOutLeft.duration(200)}
          style={[styles.page, isCompact && styles.pageCompact]}
        >
          <View style={styles.intro}>
            <Text
              variant="h1"
              style={styles.title}
              numberOfLines={titleLines}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
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
        <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
          <View style={styles.footer}>
            {onNext ? (
              <View style={styles.nextWrap}>
                <Button
                  label={nextLabel}
                  onPress={onNext}
                  disabled={nextDisabled}
                  accessibilityHint={
                    nextDisabled
                      ? nextDisabledReason ?? 'Complete this step before continuing.'
                      : undefined
                  }
                />
                {nextDisabled && nextDisabledReason ? (
                  <Text variant="bodyMuted" style={styles.nextDisabledReason}>
                    {nextDisabledReason}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </SafeAreaView>
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
    lineHeight: 24,
  },
  body: {
    gap: spacing.sm,
  },
  footerSafe: {
    backgroundColor: colors.backgroundPrimary,
  },
  footer: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundPrimary,
  },
  nextWrap: {
    width: '100%',
    gap: spacing.xs,
  },
  nextDisabledReason: {
    textAlign: 'center',
  },
});
