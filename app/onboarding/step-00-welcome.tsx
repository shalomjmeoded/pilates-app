import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingShell } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, radius, spacing } from '@/theme';

const WELCOME_SHOWCASE_IMAGE = require('../../assets/onboarding/welcome-showcase-v2.png');
const WELCOME_IMAGE_ASPECT_RATIO = 1024 / 1536;

export default function Step00Welcome() {
  const { step, goNext, goToStep } = useOnboardingNavigation(1);
  const entryMode = useOnboardingStore((state) => state.entryMode);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const imageHeight = Math.min(height < 760 ? 360 : 440, height * 0.52);
  const imageWidth = imageHeight * WELCOME_IMAGE_ASPECT_RATIO;

  const returning = entryMode === 'returning';

  return (
    <OnboardingShell
      step={step}
      title={returning ? 'Welcome back to BetterMe' : 'Welcome to BetterMe'}
      subtitle={
        returning
          ? 'Your saved plan is ready for a quick review.'
          : 'AI-Powered Pilates, Fitness, and Nutrition coach'
      }
      showBack={false}
      hideFooter
      scrollEnabled={false}
      titleLines={2}
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
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  },
});
