import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { ExerciseMediaView, ExerciseSwapReasonSheet } from '@/components/workout';
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
import { colors, spacing } from '@/theme';
import { buildExerciseYouTubeSearchUrl } from '@/utils/exerciseVideo';

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

        <ExerciseMediaView exercise={exercise} variant="gif" fillWidth />

        <Card style={styles.card}>
          <Text variant="label">Today’s prescription</Text>
          <Text variant="h2" style={styles.prescription}>
            {prescription}
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="label">Target muscles</Text>
          <Text variant="body">Primary: {titleCase(exercise.muscleGroup)}</Text>
          {secondaryTargets ? (
            <Text variant="bodyMuted">Secondary: {secondaryTargets}</Text>
          ) : null}
          <Text variant="bodyMuted">Equipment: {titleCase(exercise.equipment)}</Text>
          <Text variant="bodyMuted">Difficulty: {titleCase(exercise.difficulty)}</Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="label">About</Text>
          <Text variant="body">{exercise.description}</Text>
        </Card>

        <Card style={styles.card}>
          <Text variant="label">Instructions</Text>
          {exercise.instructions.map((step, index) => (
            <Text key={`${exercise.id}-step-${index}`} variant="body">
              {index + 1}. {step}
            </Text>
          ))}
        </Card>

        <Button
          label="Watch Reference Video"
          variant="secondary"
          onPress={() => void Linking.openURL(buildExerciseYouTubeSearchUrl(exercise))}
          accessibilityLabel={`Search YouTube for ${exercise.name} reference videos`}
        />

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

const styles = StyleSheet.create({
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
  prescription: {
    color: colors.brandPrimary,
  },
  errorText: {
    color: colors.brandPrimary,
  },
});
