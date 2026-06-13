import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';
import { getOnboardingPhase, getOnboardingReason } from '@/onboarding/stepCopy';
import { colors, radius, spacing } from '@/theme';

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
  phaseLabel?: string;
  reasonWhy?: string | null;
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
  phaseLabel,
  reasonWhy,
}: OnboardingShellProps) {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;
  const phase = phaseLabel ?? getOnboardingPhase(step);
  const reason = reasonWhy === null ? undefined : (reasonWhy ?? getOnboardingReason(step));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {showBack && onBack ? <SubscreenTopBar onPress={onBack} /> : null}
      {!hideStepIndicator ? (
        <View style={styles.header}>
          <Text variant="label" style={styles.phase}>
            {phase}
          </Text>
          <View style={styles.stepRow}>
            <Text variant="caption">
              Step {step} of {ONBOARDING_TOTAL_STEPS}
            </Text>
          </View>
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
          entering={FadeInRight.duration(320)}
          exiting={FadeOutLeft.duration(220)}
          style={[styles.page, isCompact && styles.pageCompact]}
        >
          <View style={styles.intro}>
            <Text
              variant="hero"
              style={styles.title}
              numberOfLines={titleLines}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodyMuted" style={styles.subtitle}>
                {subtitle}
              </Text>
            ) : null}
            {reason ? (
              <View style={styles.reasonCard}>
                <Text variant="caption" style={styles.reasonLabel}>
                  Why we ask
                </Text>
                <Text variant="body" style={styles.reasonText}>
                  {reason}
                </Text>
              </View>
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
    gap: 6,
  },
  phase: {
    color: colors.brandSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
    borderRadius: 3,
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
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    paddingRight: spacing.xs,
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    maxWidth: 560,
    lineHeight: 24,
  },
  reasonCard: {
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: 4,
  },
  reasonLabel: {
    color: colors.brandPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    lineHeight: 22,
    color: colors.textDark,
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
