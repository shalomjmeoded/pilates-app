import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { WorkoutPlanExerciseDetail } from '@/types/workout';
import { colors, radius, spacing } from '@/theme';

import { ExerciseMediaView } from './ExerciseMediaView';

interface ExerciseCardProps {
  item: WorkoutPlanExerciseDetail;
  index: number;
  feedbackLabel?: string;
  onPress: () => void;
  disabled?: boolean;
}

export function ExerciseCard({
  item,
  index,
  feedbackLabel,
  onPress,
  disabled = false,
}: ExerciseCardProps) {
  const prescription = item.holdSeconds
    ? `${item.sets} sets · ${item.holdSeconds}s hold`
    : `${item.sets} sets · ${item.reps ?? '—'} reps`;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.cardDisabled]}
    >
      <ExerciseMediaView exercise={item.exercise} variant="thumbnail" size={72} />
      <View style={styles.content}>
        <Text variant="label">Movement {index + 1}</Text>
        <Text variant="h2" style={styles.name}>
          {item.exercise.name}
        </Text>
        <Text variant="bodyMuted">{item.exercise.muscleGroup}</Text>
        <Text variant="body" style={styles.prescription}>
          {prescription}
        </Text>
        {feedbackLabel ? (
          <Text variant="label" style={styles.feedback}>
            {feedbackLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  cardDisabled: {
    opacity: 0.72,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    lineHeight: 24,
  },
  prescription: {
    marginTop: spacing.xs,
    color: colors.brandPrimary,
  },
  feedback: {
    marginTop: spacing.xs,
    color: colors.accentCool,
  },
});
