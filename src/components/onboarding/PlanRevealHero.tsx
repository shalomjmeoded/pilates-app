import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
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
  return (
    <View style={[styles.hero, shadows.hero]}>
      <View style={styles.shimmer} />
      <Text variant="label" style={styles.eyebrow}>
        Your plan reveal
      </Text>
      <Text variant="bodyMuted" style={styles.subtitle}>
        Built from your answers.
      </Text>
      <View style={styles.cardStack}>
        <Animated.View entering={FadeInDown.delay(80).duration(320)} style={styles.revealCard}>
          <Text variant="label">Daily calories</Text>
          <Text variant="section" style={styles.value}>
            {calories}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(170).duration(320)} style={styles.revealCard}>
          <Text variant="label">Protein target</Text>
          <Text variant="section" style={styles.value}>
            {proteinG}g
          </Text>
          <Text variant="caption">
            Carbs {carbsG}g · Fat {fatG}g · Fiber {fiberG}g
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(260).duration(320)} style={styles.revealCard}>
          <Text variant="label">Weekly workouts</Text>
          <Text variant="section" style={styles.value}>
            {workoutsPerWeek}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(350).duration(320)} style={styles.revealCard}>
          <Text variant="label">First milestone</Text>
          <Text variant="body" style={styles.timeline}>
            {firstMilestone}
          </Text>
          <Text variant="caption">{timelineLabel}</Text>
        </Animated.View>
      </View>
      <View style={styles.footerRow}>
        <Text variant="caption" style={styles.footerText}>
          Personalized targets only.
        </Text>
      </View>
    </View>
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
  subtitle: {
    marginBottom: spacing.xs,
  },
  cardStack: {
    gap: spacing.xs,
  },
  revealCard: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 2,
  },
  value: {
    color: colors.brandPrimary,
  },
  timeline: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: colors.textDark,
  },
  footerRow: {
    marginTop: 2,
    alignItems: 'center',
  },
  footerText: {
    color: colors.brandSecondary,
  },
});
