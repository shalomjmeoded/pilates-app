import { Image, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { muscleGroupIcon } from '@/components/media';
import { Text } from '@/components/ui/Text';
import { resolveExerciseDisplayMedia } from '@/constants/exerciseMedia';
import type { WorkoutPlanExerciseDetail } from '@/types/workout';
import type { Exercise } from '@/types/exercise';
import { colors, radius, shadows, spacing, createDynamicStyles } from '@/theme';

interface ExerciseGridCardProps {
  item: WorkoutPlanExerciseDetail;
  onPress: () => void;
  disabled?: boolean;
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function prescriptionLabel(item: WorkoutPlanExerciseDetail): string {
  if (item.holdSeconds) {
    return `${item.sets} × ${item.holdSeconds}s hold`;
  }
  return `${item.sets} × ${item.reps ?? item.exercise.repsBaseline ?? 8} reps`;
}

function roleLabel(role: Exercise['sessionRole']): string {
  if (role === 'warmup') {
    return 'Warm-up';
  }
  if (role === 'cooldown') {
    return 'Cool-down';
  }
  return 'Main flow';
}

function ExerciseGridMedia({ exercise }: { exercise: Exercise }) {
  const media = resolveExerciseDisplayMedia(exercise);
  const source = media.thumbnail;

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
            {roleLabel(item.exercise.sessionRole)}
          </Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text variant="body" numberOfLines={2} style={styles.title}>
          {item.exercise.name}
        </Text>
        <Text variant="label" style={styles.target}>
          {titleCase(item.exercise.muscleGroup)} · {titleCase(item.exercise.difficulty)}
        </Text>
      </View>
      <View style={styles.prescriptionRow}>
        <MaterialCommunityIcons name="repeat" size={14} color={colors.brandPrimary} />
        <Text variant="label" style={styles.prescription} numberOfLines={1}>
          {prescriptionLabel(item)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = createDynamicStyles(() => ({
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
    minHeight: 25,
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
  copy: {
    gap: 2,
    paddingHorizontal: 4,
  },
  title: {
    color: colors.textDark,
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36,
  },
  target: {
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  prescriptionRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.square,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  prescription: {
    flex: 1,
    color: colors.brandPrimary,
    fontSize: 11,
    lineHeight: 15,
  },
}));
