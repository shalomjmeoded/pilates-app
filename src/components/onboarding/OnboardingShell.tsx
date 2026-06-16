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
  headerAccessorySource?: ImageSourcePropType;
  headerAccessorySources?: ImageSourcePropType[];
  headerAccessoryAccessibilityLabel?: string;
  headerAccessoryPlacement?: 'side' | 'background';
  titleTreatment?: 'softContrast';
  showHero?: boolean;
  insightText?: string;
  centerBody?: boolean;
  centerIntro?: boolean;
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
  headerAccessorySource,
  headerAccessorySources,
  headerAccessoryAccessibilityLabel,
  headerAccessoryPlacement = 'side',
  titleTreatment,
  showHero = false,
  insightText,
  centerBody = false,
  centerIntro = false,
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
  const hasHeaderAccessory = Boolean(headerAccessorySource || headerAccessorySources?.length);
  const hasHeaderAccessorySide = hasHeaderAccessory && headerAccessoryPlacement === 'side';
  const hasHeaderAccessoryBackground = hasHeaderAccessory && headerAccessoryPlacement === 'background';

  const renderHeaderAccessory = (background = false) => (
    <Animated.View
      entering={FadeInRight.delay(120).duration(260)}
      pointerEvents={background ? 'none' : 'auto'}
      style={[styles.headerAccessory, background && styles.headerAccessoryBackground]}
    >
      {headerAccessorySources?.length ? (
        headerAccessorySources.slice(0, 3).map((source, index) => (
          <Image
            key={index}
            source={source}
            style={[
              styles.headerAccessoryImageLayer,
              background
                ? headerAccessoryBackgroundLayerStyleList[index]
                : headerAccessoryLayerStyleList[index],
            ]}
            resizeMode="cover"
            accessibilityLabel={
              !background && index === 0
                ? headerAccessoryAccessibilityLabel ?? 'Pilates movement preview'
                : undefined
            }
            accessible={!background && index === 0}
          />
        ))
      ) : headerAccessorySource ? (
        <Image
          source={headerAccessorySource}
          style={[styles.headerAccessoryImage, background && styles.headerAccessoryImageBackground]}
          resizeMode="cover"
          accessibilityLabel={
            background
              ? undefined
              : headerAccessoryAccessibilityLabel ?? 'Pilates movement preview'
          }
          accessible={!background}
        />
      ) : null}
    </Animated.View>
  );

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
              {step}/{ONBOARDING_TOTAL_STEPS}
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
          <View style={[styles.intro, centerIntro && styles.introCentered]}>
            {showHero ? (
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
            ) : null}
            {hasHeaderAccessoryBackground ? renderHeaderAccessory(true) : null}
            <View style={hasHeaderAccessorySide ? styles.introHeaderRow : styles.introHeaderContent}>
              <View style={hasHeaderAccessorySide ? styles.introCopy : undefined}>
                <Animated.View
                  entering={FadeInDown.delay(60).duration(280)}
                  style={[
                    titleTreatment === 'softContrast' && styles.titleContrastWrap,
                    centerIntro && titleTreatment === 'softContrast' && styles.titleContrastCentered,
                  ]}
                >
                  <Text
                    variant="hero"
                    style={[
                      styles.title,
                      titleTreatment === 'softContrast' && styles.titleContrast,
                      centerIntro && styles.titleCentered,
                    ]}
                    numberOfLines={titleLines}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  >
                    {title}
                  </Text>
                </Animated.View>
                {subtitle ? (
                  <Animated.View entering={FadeInUp.delay(100).duration(260)}>
                    <Text variant="bodyMuted" style={[styles.subtitle, centerIntro && styles.subtitleCentered]}>
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
              {hasHeaderAccessorySide ? renderHeaderAccessory(false) : null}
            </View>
          </View>
          <View style={[styles.body, centerBody && styles.bodyCentered]}>{children}</View>
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
    paddingTop: spacing.xs,
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
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  page: {
    flexGrow: 1,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  pageCompact: {
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  intro: {
    position: 'relative',
    gap: spacing.sm,
  },
  introCentered: {
    alignItems: 'center',
  },
  introHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1,
  },
  introHeaderContent: {
    zIndex: 1,
  },
  introCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  headerAccessory: {
    width: 104,
    height: 60,
    borderRadius: 18,
    overflow: 'visible',
  },
  headerAccessoryBackground: {
    position: 'absolute',
    top: 14,
    right: -12,
    width: 136,
    height: 72,
    opacity: 0.18,
    zIndex: 0,
  },
  headerAccessoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHero,
  },
  headerAccessoryImageBackground: {
    opacity: 0.55,
  },
  headerAccessoryImageLayer: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHero,
  },
  title: {
    flexShrink: 1,
    paddingRight: spacing.xs,
    fontSize: 32,
    lineHeight: 38,
  },
  titleContrastWrap: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(205, 190, 178, 0.52)',
    backgroundColor: 'rgba(253, 252, 250, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  titleContrastCentered: {
    alignSelf: 'center',
  },
  titleContrast: {
    paddingRight: 0,
    textShadowColor: 'rgba(253, 252, 250, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  titleCentered: {
    paddingRight: 0,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 520,
    lineHeight: 21,
  },
  subtitleCentered: {
    textAlign: 'center',
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
  bodyCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.md,
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

const headerAccessoryLayerStyles = StyleSheet.create({
  front: {
    width: 48,
    height: 48,
    right: 28,
    top: 7,
    borderRadius: 17,
    opacity: 0.96,
    zIndex: 3,
  },
  backLeft: {
    width: 46,
    height: 46,
    right: 58,
    top: 5,
    borderRadius: 16,
    opacity: 0.82,
    transform: [{ rotate: '-10deg' }],
    zIndex: 2,
  },
  backRight: {
    width: 46,
    height: 46,
    right: 0,
    top: 5,
    borderRadius: 16,
    opacity: 0.78,
    transform: [{ rotate: '10deg' }],
    zIndex: 1,
  },
});

const headerAccessoryLayerStyleList = [
  headerAccessoryLayerStyles.front,
  headerAccessoryLayerStyles.backLeft,
  headerAccessoryLayerStyles.backRight,
];

const headerAccessoryBackgroundLayerStyles = StyleSheet.create({
  front: {
    width: 58,
    height: 58,
    right: 38,
    top: 6,
    borderRadius: 19,
    opacity: 0.82,
    zIndex: 3,
  },
  backLeft: {
    width: 52,
    height: 52,
    right: 78,
    top: 9,
    borderRadius: 17,
    opacity: 0.7,
    transform: [{ rotate: '-10deg' }],
    zIndex: 2,
  },
  backRight: {
    width: 52,
    height: 52,
    right: 4,
    top: 9,
    borderRadius: 17,
    opacity: 0.66,
    transform: [{ rotate: '10deg' }],
    zIndex: 1,
  },
});

const headerAccessoryBackgroundLayerStyleList = [
  headerAccessoryBackgroundLayerStyles.front,
  headerAccessoryBackgroundLayerStyles.backLeft,
  headerAccessoryBackgroundLayerStyles.backRight,
];
