import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme';

const LOADING_DURATION_MS = 3200;

const STAGES = [
  'Analyzing goals',
  'Building workouts',
  'Calculating nutrition',
  'Preparing milestones',
] as const;

interface OnboardingPlanProgressProps {
  onComplete: () => void;
}

export function OnboardingPlanProgress({ onComplete }: OnboardingPlanProgressProps) {
  const progress = useSharedValue(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const stageTimers = [
      setTimeout(() => setStageIndex(1), LOADING_DURATION_MS * 0.22),
      setTimeout(() => setStageIndex(2), LOADING_DURATION_MS * 0.48),
      setTimeout(() => setStageIndex(3), LOADING_DURATION_MS * 0.74),
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
      <View style={styles.stageList}>
        {STAGES.map((label, index) => {
          const active = index <= stageIndex;
          return (
            <Animated.View
              key={label}
              entering={FadeIn.duration(240)}
              style={[styles.stageRow, active && styles.stageRowActive]}
            >
              <View style={[styles.dot, active && styles.dotActive]} />
              <Text variant="body" style={active ? styles.stageActive : styles.stagePending}>
                {label}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

export const ONBOARDING_PLAN_LOADING_MS = LOADING_DURATION_MS;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 340,
    gap: spacing.md,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
  },
  stageList: {
    gap: spacing.sm,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    opacity: 0.45,
  },
  stageRowActive: {
    opacity: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    backgroundColor: colors.brandSecondary,
  },
  stageActive: {
    color: colors.textDark,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  stagePending: {
    color: colors.textMuted,
  },
});
