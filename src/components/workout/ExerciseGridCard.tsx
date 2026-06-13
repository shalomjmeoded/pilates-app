import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { muscleGroupIcon } from '@/components/media';
import { Text } from '@/components/ui/Text';
import { getExerciseGifSource, getExerciseThumbnailSource } from '@/constants/exerciseMedia';
import type { WorkoutPlanExerciseDetail } from '@/types/workout';
import type { Exercise } from '@/types/exercise';
import { colors, radius, shadows, spacing } from '@/theme';

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

function ExerciseGridMedia({ exercise }: { exercise: Exercise }) {
  const source = getExerciseThumbnailSource(exercise.id) ?? getExerciseGifSource(exercise.id);

  if (!source) {
    return (
      <View style={styles.mediaFrame}>
        <MaterialCommunityIcons
          name={muscleGroupIcon(exercise.muscleGroup)}
          size={40}
          color={colors.brandSecondary}
        />
      </View>
    );
  }

  return (
    <View style={styles.mediaFrame}>
      <Image
        source={source}
        style={styles.mediaImage}
        resizeMode="contain"
        accessibilityLabel={`${exercise.name} thumbnail`}
      />
    </View>
  );
}

export function ExerciseGridCard({ item, onPress, disabled = false }: ExerciseGridCardProps) {
  const durationMin = estimateDurationMinutes(item);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.card, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <ExerciseGridMedia exercise={item.exercise} />
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
    borderColor: colors.borderStrong,
    padding: spacing.xs,
    gap: spacing.xs,
    minHeight: 220,
    ...shadows.card,
  },
  mediaFrame: {
    alignSelf: 'stretch',
    aspectRatio: 4 / 3,
    backgroundColor: colors.illustrationBg,
    borderRadius: radius.square,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  disabled: {
    opacity: 0.72,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.992 }],
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
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  difficultyText: {
    color: colors.brandPrimary,
    fontSize: 11,
  },
  duration: {
    color: colors.textMuted,
    fontSize: 11,
  },
  copy: {
    gap: 2,
    paddingHorizontal: 4,
    paddingBottom: 2,
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
