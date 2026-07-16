import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { ExerciseSwapReasonSheet, ExerciseYouTubeEmbed } from '@/components/workout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getExerciseById } from '@/db/repositories/exerciseRepository';
import { getWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { isDateToday } from '@/engines/workout';
import { useExerciseSubstitution } from '@/hooks/useExerciseSubstitution';
import { usePremium } from '@/hooks/usePremium';
import type { Exercise } from '@/types/exercise';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';
import type { WorkoutPlanExercise } from '@/types/workout';
import { colors, spacing, createDynamicStyles } from '@/theme';

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ExerciseDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exerciseId: string;
    planDate: string;
    sortOrder?: string;
  }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [planExercise, setPlanExercise] = useState<WorkoutPlanExercise | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [swapSheetVisible, setSwapSheetVisible] = useState(false);
  const [swapMessage, setSwapMessage] = useState<string | null>(null);

  const { substitute, isSwapping, error, clearError } = useExerciseSubstitution(params.planDate);
  const { requirePremium } = usePremium();

  const reload = async () => {
    const [exerciseRow, plan] = await Promise.all([
      getExerciseById(params.exerciseId),
      getWorkoutPlanByDate(params.planDate),
    ]);

    setExercise(exerciseRow);
    setPlanId(plan?.id ?? null);
    const sortOrder = params.sortOrder ? Number(params.sortOrder) : undefined;
    const match = plan?.exercises.find(
      (item) =>
        item.exerciseId === params.exerciseId &&
        (sortOrder ? item.sortOrder === sortOrder : true),
    );
    setPlanExercise(match ?? null);
  };

  useEffect(() => {
    void reload();
  }, [params.exerciseId, params.planDate, params.sortOrder]);

  if (!exercise) {
    return null;
  }

  const prescription = planExercise?.holdSeconds
    ? `${planExercise.sets} sets · ${planExercise.holdSeconds}s hold`
    : planExercise
      ? `${planExercise.sets} sets · ${planExercise.reps ?? '—'} reps`
      : '—';

  const canSwap = Boolean(planId && planExercise && isDateToday(params.planDate));
  const secondaryTargets = exercise.secondaryMuscles
    .filter((muscle) => muscle !== exercise.muscleGroup)
    .map(titleCase)
    .join(', ');

  const handleSelectSwapReason = async (reason: ExerciseSwapReason) => {
    if (!planId || !planExercise) {
      return;
    }

    clearError();
    setSwapMessage(null);

    const result = await substitute({
      exercise,
      planId,
      planExercise,
      reason,
    });

    if (!result) {
      return;
    }

    setSwapMessage(
      `Swapped to ${result.exerciseName}. ${result.reason} ${result.coachingNote}`,
    );
    setExercise(result.exercise);
    setPlanExercise({ ...planExercise, exerciseId: result.exercise.id });
    setSwapSheetVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SubscreenTopBar />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="h1">{exercise.name}</Text>
          <Text variant="bodyMuted">{titleCase(exercise.muscleGroup)}</Text>
        </View>

        <ExerciseYouTubeEmbed exercise={exercise} allowStreaming />

        <Card style={styles.summaryCard}>
          <View style={styles.prescriptionRow}>
            <View style={styles.prescriptionIcon}>
              <MaterialCommunityIcons name="repeat" size={18} color={colors.brandPrimary} />
            </View>
            <View style={styles.prescriptionCopy}>
              <Text variant="caption">Today’s prescription</Text>
              <Text variant="h2" style={styles.prescription}>
                {prescription}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MetaPill label={titleCase(exercise.difficulty)} />
            <MetaPill label={titleCase(exercise.equipment)} />
            <MetaPill label={titleCase(exercise.sessionRole)} />
          </View>
          <Text variant="body">{exercise.description}</Text>
          {secondaryTargets ? (
            <Text variant="bodyMuted">
              Also works {secondaryTargets}.
            </Text>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text variant="label">Instructions</Text>
          {exercise.instructions.map((step, index) => (
            <Text key={`${exercise.id}-step-${index}`} variant="body">
              {index + 1}. {step}
            </Text>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text variant="label">Common mistakes</Text>
          {exercise.commonMistakes.map((mistake, index) => (
            <Text key={`${exercise.id}-mistake-${index}`} variant="bodyMuted">
              • {mistake}
            </Text>
          ))}
        </Card>

        {canSwap ? (
          <Button
            label={isSwapping ? 'Finding replacement...' : 'Swap Exercise'}
            variant="secondary"
            onPress={() => requirePremium('exercise_swap', () => setSwapSheetVisible(true))}
            disabled={isSwapping}
            accessibilityLabel="Swap this exercise for a similar one"
          />
        ) : null}

        {swapMessage ? <Text variant="bodyMuted">{swapMessage}</Text> : null}
        {error ? <Text variant="body" style={styles.errorText}>{error}</Text> : null}

      </ScrollView>

      <ExerciseSwapReasonSheet
        visible={swapSheetVisible}
        isLoading={isSwapping}
        onSelectReason={(reason) => void handleSelectSwapReason(reason)}
        onClose={() => setSwapSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text variant="caption" style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    padding: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.xs,
  },
  summaryCard: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceCanvas,
  },
  prescriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  prescriptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRose,
  },
  prescriptionCopy: {
    flex: 1,
    gap: 1,
  },
  prescription: {
    color: colors.brandPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.xs,
    paddingVertical: 5,
  },
  metaPillText: {
    color: colors.textMuted,
  },
  errorText: {
    color: colors.brandPrimary,
  },
}));
