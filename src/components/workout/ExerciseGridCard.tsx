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

export function ExerciseGridCard({ item, onPress, disabled = false }: ExerciseGridCardProps) {
  const prescription = item.holdSeconds
    ? `${item.sets}× ${item.holdSeconds}s`
    : `${item.sets}× ${item.reps ?? '—'}`;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.disabled]}
    >
      <ExerciseMediaView exercise={item.exercise} variant="thumbnail" size={96} />
      <View style={styles.copy}>
        <Text variant="body" numberOfLines={2} style={styles.title}>
          {item.exercise.name}
        </Text>
        <Text variant="label" style={styles.target}>
          {titleCase(item.exercise.muscleGroup)}
        </Text>
        <Text variant="label" style={styles.prescription}>
          {prescription}
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
    minHeight: 188,
  },
  disabled: {
    opacity: 0.72,
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
  prescription: {
    color: colors.brandPrimary,
  },
});
