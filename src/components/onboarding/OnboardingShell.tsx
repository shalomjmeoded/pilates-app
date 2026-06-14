import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReactNode, useEffect } from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ONBOARDING_TOTAL_STEPS } from '@/onboarding/constants';
import { getOnboardingPhase, getOnboardingPhaseIndex } from '@/onboarding/stepCopy';
import { colors, radius, spacing } from '@/theme';
import { lightImpactHaptic } from '@/utils/haptics';

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
  heroImageSource?: ImageSourcePropType;
  heroLoopSource?: ImageSourcePropType;
  heroAccessibilityLabel?: string;
  insightText?: string;
}

const PHASE_HERO_IMAGES: Record<number, ImageSourcePropType> = {
  1: require('../../../assets/onboarding/hero-rhythm.png'),
  2: require('../../../assets/onboarding/hero-body.png'),
  3: require('../../../assets/onboarding/hero-goals.png'),
  4: require('../../../assets/onboarding/hero-plan.png'),
};

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
  reasonWhy: _reasonWhy,
  heroImageSource,
  heroLoopSource,
  heroAccessibilityLabel,
  insightText,
}: OnboardingShellProps) {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;
  const phase = phaseLabel ?? getOnboardingPhase(step);
  const phaseIndex = getOnboardingPhaseIndex(step);
  const progress = useSharedValue(0);
  const mediaScale = useSharedValue(1.02);
  const mediaX = useSharedValue(-4);
  const resolvedHeroSource = heroLoopSource ?? heroImageSource ?? PHASE_HERO_IMAGES[phaseIndex];

  useEffect(() => {
    progress.value = withTiming(step / ONBOARDING_TOTAL_STEPS, { duration: 360 });
  }, [progress, step]);

  useEffect(() => {
    mediaScale.value = withRepeat(
      withSequence(
        withTiming(1.09, { duration: 6800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.02, { duration: 6800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    mediaX.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 6400, easing: Easing.inOut(Easing.ease) }),
        withTiming(-4, { duration: 6400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [mediaScale, mediaX, phaseIndex]);

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
  }));

  const mediaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mediaScale.value }, { translateX: mediaX.value }],
  }));

  const handleNextPress = () => {
    lightImpactHaptic();
    onNext?.();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {showBack && onBack ? <SubscreenTopBar onPress={onBack} /> : null}
      {!hideStepIndicator ? (
        <View style={styles.header}>
          <View style={styles.stepRow}>
            <Text variant="label" style={styles.phase}>
              Phase {phaseIndex}: {phase}
            </Text>
            <Text variant="caption">
              Phase {phaseIndex} of 4
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Onboarding progress"
            accessibilityValue={{ min: 0, max: ONBOARDING_TOTAL_STEPS, now: step }}
            style={styles.progressTrack}
          >
            <Animated.View style={[styles.progressFill, progressFillStyle]} />
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
            <Animated.View entering={FadeInDown.duration(320)} style={styles.visualArea}>
              {resolvedHeroSource ? (
                <Animated.View sharedTransitionTag="onboardingHeroMedia" style={styles.heroMediaWrap}>
                  <Animated.Image
                    source={resolvedHeroSource}
                    style={[styles.heroMedia, mediaStyle]}
                    resizeMode="cover"
                    accessibilityLabel={heroAccessibilityLabel ?? 'Onboarding hero media'}
                  />
                  <View style={styles.heroMediaOverlay} pointerEvents="none" />
                </Animated.View>
              ) : (
                <Animated.View sharedTransitionTag="onboardingHeroOrb" style={styles.visualOrb}>
                  <MaterialCommunityIcons
                    name={phaseIndex === 1 ? 'leaf' : phaseIndex === 2 ? 'ruler' : phaseIndex === 3 ? 'bullseye-arrow' : 'star-four-points'}
                    size={30}
                    color={colors.brandPrimary}
                  />
                </Animated.View>
              )}
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(60).duration(280)}>
              <Text
                variant="hero"
                style={styles.title}
                numberOfLines={titleLines}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {title}
              </Text>
            </Animated.View>
            {subtitle ? (
              <Animated.View entering={FadeInUp.delay(100).duration(260)}>
                <Text variant="bodyMuted" style={styles.subtitle}>
                  {subtitle}
                </Text>
              </Animated.View>
            ) : null}
            {insightText ? (
              <Animated.View entering={FadeInUp.delay(140).duration(240)} style={styles.insightPill}>
                <MaterialCommunityIcons name="star-four-points" size={14} color={colors.brandPrimary} />
                <Text variant="caption" style={styles.insightText}>
                  {insightText}
                </Text>
              </Animated.View>
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
                  onPress={handleNextPress}
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
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    maxWidth: 520,
    lineHeight: 22,
  },
  insightPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  insightText: {
    color: colors.brandPrimary,
  },
  visualArea: {
    alignItems: 'center',
  },
  visualOrb: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surfaceHero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  heroMediaWrap: {
    width: '100%',
    maxWidth: 360,
    height: 136,
    borderRadius: radius.hero,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceHero,
  },
  heroMedia: {
    width: '100%',
    height: '100%',
  },
  heroMediaOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 28, 26, 0.08)',
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
