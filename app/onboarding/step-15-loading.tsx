import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingPlanProgress } from '@/components/onboarding';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors, spacing } from '@/theme';

export default function Step15Loading() {
  const { replaceNext, goToStep } = useOnboardingNavigation(16);
  const baselinePlan = useOnboardingStore((state) => state.draft.baselinePlan);
  const buildPlanFromDraft = useOnboardingStore((state) => state.buildPlanFromDraft);
  const [error, setError] = useState<string | null>(null);
  const glow = useSharedValue(0.6);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (baselinePlan) {
        return;
      }

      const plan = buildPlanFromDraft();
      if (!plan) {
        setError('Some onboarding answers are missing. Go back and complete each step.');
      }
    }, [baselinePlan, buildPlanFromDraft]),
  );

  useFocusEffect(
    useCallback(() => {
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, [glow]),
  );

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const handleComplete = useCallback(() => {
    replaceNext();
  }, [replaceNext]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text variant="h2" style={styles.title}>
            Couldn&apos;t build your plan
          </Text>
          <Text variant="bodyMuted" style={styles.subtitle}>
            {error}
          </Text>
          <Button label="Go back" onPress={() => goToStep(15)} />
        </View>
      </SafeAreaView>
    );
  }

  if (!baselinePlan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View style={[styles.mark, glowStyle]}>
            <Text variant="h1" style={styles.logo}>
              Tune
            </Text>
          </Animated.View>
          <Text variant="h2" style={styles.title}>
            Tuning your personalized plan
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.mark, glowStyle]}>
          <Text variant="h1" style={styles.logo}>
            Tune
          </Text>
        </Animated.View>
        <Text variant="h2" style={styles.title}>
          Tuning your personalized plan
        </Text>
        <Text variant="bodyMuted" style={styles.subtitle}>
          Calculating calories, macros, and your movement profile locally on your device.
        </Text>
        <OnboardingPlanProgress onComplete={handleComplete} />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  mark: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: colors.brandPrimary,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
