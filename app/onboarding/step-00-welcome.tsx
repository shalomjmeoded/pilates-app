import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingShell } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, radius, spacing, createDynamicStyles } from '@/theme';
import { captureProductEvent, resetOnboardingAnalyticsSession } from '@/services/analytics/analyticsCore';

const WELCOME_SHOWCASE_IMAGE = require('../../assets/onboarding/welcome-showcase-v2.png');
const WELCOME_IMAGE_ASPECT_RATIO = 1024 / 1536;

export default function Step00Welcome() {
  const { step, goNext, goToStep } = useOnboardingNavigation(1);
  const entryMode = useOnboardingStore((state) => state.entryMode);
  const resetDraft = useOnboardingStore((state) => state.resetDraft);
  const setOnboardingCompleted = usePreferencesStore((state) => state.setOnboardingCompleted);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const imageHeight = Math.min(height < 760 ? 320 : 390, height * 0.46);
  const imageWidth = imageHeight * WELCOME_IMAGE_ASPECT_RATIO;

  const returning = entryMode === 'returning';

  const restartOnboarding = () => {
    captureProductEvent('onboarding restarted', { entry_mode: entryMode });
    resetOnboardingAnalyticsSession();
    resetDraft();
    setOnboardingCompleted(false);
    goToStep(2);
  };

  return (
    <OnboardingShell
      step={step}
      title={returning ? 'Welcome back to Form: Pilates Studio' : 'Welcome to Form: Pilates Studio'}
      subtitle={
        returning
          ? 'Your saved plan is ready for a quick review.'
          : 'AI-Powered Pilates, Fitness, and Nutrition coach'
      }
      showBack={false}
      hideFooter
      scrollEnabled={false}
      titleLines={3}
      phaseLabel="Welcome"
      centerBody
      centerIntro
      showBrandMark
    >
      <View style={[styles.screen, { paddingBottom: Math.max(spacing.xs, insets.bottom) }]}>
        <Animated.View entering={FadeInDown.delay(80).duration(420)} style={styles.showcaseWrap}>
          <Animated.Image
            entering={FadeInUp.delay(150).duration(560)}
            source={WELCOME_SHOWCASE_IMAGE}
            style={[styles.showcaseImage, { width: imageWidth, height: imageHeight }]}
            resizeMode="cover"
            accessibilityLabel="Pilates, nutrition, and progress coaching preview"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(220).duration(280)} style={styles.ctaWrap}>
          <Button
            label={returning ? 'Review my plan' : 'Get started'}
            onPress={returning ? () => goToStep(14) : goNext}
          />
          {returning ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start over with new answers"
              onPress={restartOnboarding}
              style={({ pressed }) => [styles.restartButton, pressed && styles.restartButtonPressed]}
            >
              <MaterialCommunityIcons name="refresh" size={15} color={colors.brandPrimary} />
              <Text variant="caption" style={styles.restartText}>
                Start over with new answers
              </Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = createDynamicStyles(() => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  showcaseWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.hero,
    backgroundColor: colors.surfaceHero,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  showcaseImage: {
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceHero,
  },
  ctaWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  restartButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
  },
  restartButtonPressed: {
    backgroundColor: colors.surfaceRose,
    opacity: 0.86,
  },
  restartText: {
    color: colors.brandPrimary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
}));
