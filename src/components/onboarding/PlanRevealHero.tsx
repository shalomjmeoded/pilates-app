import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, radius, shadows, spacing } from '@/theme';

interface PlanRevealHeroProps {
  calories: number;
  proteinG: number;
  workoutsPerWeek: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  timelineLabel: string;
  firstMilestone: string;
}

export function PlanRevealHero({
  calories,
  proteinG,
  workoutsPerWeek,
  carbsG,
  fatG,
  fiberG,
  timelineLabel,
  firstMilestone,
}: PlanRevealHeroProps) {
  const scale = useSharedValue(0.94);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    glow.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [glow, scale]);

  const heroAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.85 + glow.value * 0.15,
  }));

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={[styles.hero, shadows.hero, heroAnimStyle]}>
      <View style={styles.shimmer} />
      <Text variant="label" style={styles.eyebrow}>
        ✦ Your personalized plan
      </Text>
      <Text variant="display" style={styles.calories}>
        {calories}
      </Text>
      <Text variant="bodyMuted" style={styles.calorieUnit}>
        daily calories · shaped for your body
      </Text>

      <View style={styles.divider} />

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text variant="h2">{proteinG}g</Text>
          <Text variant="label">Protein</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="h2">{workoutsPerWeek}×</Text>
          <Text variant="label">Movement / wk</Text>
        </View>
      </View>

      <View style={styles.macroRow}>
        <Text variant="bodyMuted">
          Carbs {carbsG}g · Fat {fatG}g · Fiber {fiberG}g
        </Text>
      </View>

      <View style={styles.milestoneCard}>
        <Text variant="label">Your rhythm</Text>
        <Text variant="body" style={styles.timeline}>
          {timelineLabel}
        </Text>
        <Text variant="bodyMuted" style={styles.milestone}>
          First milestone: {firstMilestone}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceHero,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surfaceRose,
    opacity: 0.4,
  },
  eyebrow: {
    color: colors.brandSecondary,
  },
  calories: {
    color: colors.brandPrimary,
    marginTop: spacing.xs,
    fontSize: 48,
    lineHeight: 52,
  },
  calorieUnit: {
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    gap: 4,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  macroRow: {
    marginTop: spacing.xs,
  },
  milestoneCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    padding: spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timeline: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: colors.textDark,
  },
  milestone: {
    marginTop: 4,
  },
});
