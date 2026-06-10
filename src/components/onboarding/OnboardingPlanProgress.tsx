import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, spacing } from '@/theme';

const LOADING_DURATION_MS = 900;

const STAGES = [
  'Calculating metabolism...',
  'Balancing macros...',
  'Finalizing your plan...',
] as const;

interface OnboardingPlanProgressProps {
  onComplete: () => void;
}

export function OnboardingPlanProgress({ onComplete }: OnboardingPlanProgressProps) {
  const progress = useSharedValue(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const stageTimers = [
      setTimeout(() => setStageIndex(1), LOADING_DURATION_MS * 0.34),
      setTimeout(() => setStageIndex(2), LOADING_DURATION_MS * 0.67),
    ];

    progress.value = withTiming(
      1,
      { duration: LOADING_DURATION_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      },
    );

    return () => {
      stageTimers.forEach(clearTimeout);
    };
  }, [onComplete, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text variant="bodyMuted" style={styles.stageLabel}>
        {STAGES[stageIndex]}
      </Text>
    </View>
  );
}

export const ONBOARDING_PLAN_LOADING_MS = LOADING_DURATION_MS;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    gap: spacing.sm,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
    borderRadius: 4,
  },
  stageLabel: {
    textAlign: 'center',
  },
});
