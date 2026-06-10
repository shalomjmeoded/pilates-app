import { Pressable, StyleSheet, View } from 'react-native';

import { ExerciseMediaView } from '@/components/workout/ExerciseMediaView';
import { Text } from '@/components/ui/Text';
import type { WorkoutPlanExerciseDetail } from '@/types/workout';
import { colors, radius, spacing } from '@/theme';

interface ExerciseGridCardProps {
  item: WorkoutPlanExerciseDetail;
  onPress: () => void;
  disabled?: boolean;
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function estimateDurationMinutes(item: WorkoutPlanExerciseDetail): number {
  if (item.holdSeconds) {
    return Math.max(1, Math.round((item.sets * item.holdSeconds) / 60));
  }
  const reps = item.reps ?? item.exercise.repsBaseline ?? 10;
  return Math.max(1, Math.round((item.sets * reps * 3) / 60));
}

export function ExerciseGridCard({ item, onPress, disabled = false }: ExerciseGridCardProps) {
  const durationMin = estimateDurationMinutes(item);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.disabled]}
    >
      <ExerciseMediaView exercise={item.exercise} variant="thumbnail" size={96} />
      <View style={styles.badgeRow}>
        <View style={styles.difficultyBadge}>
          <Text variant="label" style={styles.difficultyText}>
            {titleCase(item.exercise.difficulty)}
          </Text>
        </View>
        <Text variant="label" style={styles.duration}>
          ~{durationMin} min
        </Text>
      </View>
      <View style={styles.copy}>
        <Text variant="body" numberOfLines={2} style={styles.title}>
          {item.exercise.name}
        </Text>
        <Text variant="label" style={styles.target}>
          {titleCase(item.exercise.muscleGroup)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xs,
    gap: spacing.xs,
    minHeight: 196,
  },
  disabled: {
    opacity: 0.72,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  difficultyBadge: {
    backgroundColor: colors.surfaceRose,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  difficultyText: {
    color: colors.brandPrimary,
    fontSize: 10,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 10,
  },
  copy: {
    gap: 2,
    paddingHorizontal: 4,
  },
  title: {
    color: colors.textDark,
    fontSize: 14,
    lineHeight: 18,
  },
  target: {
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});
