import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
  showBack?: boolean;
  hideFooter?: boolean;
  hideStepIndicator?: boolean;
  titleLines?: number;
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
  hideStepIndicator = false,
  titleLines = 3,
}: OnboardingShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {showBack && onBack ? <SubscreenTopBar onPress={onBack} /> : null}
      {!hideStepIndicator ? (
        <View style={styles.header}>
          <Text variant="label">
            {step} / {ONBOARDING_TOTAL_STEPS}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / ONBOARDING_TOTAL_STEPS) * 100}%` }]} />
          </View>
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInRight.duration(280)} exiting={FadeOutLeft.duration(200)}>
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
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </ScrollView>

      {!hideFooter ? (
        <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
          <View style={styles.footer}>
            <View style={styles.backSpacer} />
            {onNext ? (
              <View style={styles.nextWrap}>
                <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} />
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
    paddingTop: spacing.xs,
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
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  title: {
    marginTop: spacing.md,
    flexShrink: 1,
    paddingRight: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  body: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  footerSafe: {
    backgroundColor: colors.backgroundPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
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
