import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  ExerciseGridCard,
  ResumeWorkoutBanner,
  WeekCalendarStrip,
  WorkoutEmptyState,
  WorkoutErrorState,
  WorkoutHeroCard,
  WorkoutReadOnlyBanner,
} from '@/components/workout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { discardWorkoutSession, startWorkoutSession } from '@/db/repositories/workoutRepository';
import { getCalendarDates } from '@/engines/workout';
import { useWorkoutCalendarCompletion } from '@/hooks/useWorkoutCalendarCompletion';
import { useWorkoutDay } from '@/hooks/useWorkoutDay';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStreak } from '@/hooks/useWorkoutStreak';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutPlanExerciseDetail } from '@/types/workout';
import { spacing } from '@/theme';

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveFocusTitle(exercises: WorkoutPlanExerciseDetail[]): string {
  const groups = [...new Set(exercises.slice(0, 6).map((item) => item.exercise.muscleGroup))];
  if (groups.length === 0) {
    return 'Full Body Flow';
  }
  return groups
    .slice(0, 2)
    .map((group) => titleCase(group))
    .join(' + ');
}

function estimateMinutes(exerciseCount: number): number {
  return Math.max(12, Math.round(exerciseCount * 2.2));
}

export default function WorkoutScreen() {
  const router = useRouter();
  const selectedDate = useWorkoutStore((state) => state.selectedDate);
  const setSelectedDate = useWorkoutStore((state) => state.setSelectedDate);
  const calendarDates = useMemo(() => getCalendarDates(), []);
  const { data, isLoading, errorCode, errorMessage, reload } = useWorkoutDay(selectedDate);
  const { completedDates, reload: reloadCalendar } = useWorkoutCalendarCompletion(calendarDates);
  const { stats: streakStats, reload: reloadStreak } = useWorkoutStreak();
  const { requirePremium } = usePremium();

  const canStartWorkout =
    data?.isToday &&
    !data.isReadOnly &&
    data.plan &&
    data.session?.status !== 'completed' &&
    data.exercises.length >= 9;

  const handleStartWorkout = async () => {
    if (!data?.plan) {
      return;
    }

    const session = await startWorkoutSession(data.plan.id);
    if (session.status === 'completed') {
      return;
    }

    router.push(`/(tabs)/workout/player/${session.id}`);
  };

  const openExerciseDetail = (exerciseId: string, sortOrder: number) => {
    router.push({
      pathname: '/modals/exercise-detail',
      params: {
        exerciseId,
        planDate: selectedDate,
        sortOrder: String(sortOrder),
      },
    });
  };

  const listHeader = (
    <View style={styles.headerStack}>
      <WeekCalendarStrip
        dates={calendarDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedDates={completedDates}
      />

      {errorMessage ? (
        <WorkoutErrorState code={errorCode} message={errorMessage} onRetry={() => void reload()} />
      ) : null}

      {!errorMessage && data && !data.isFuture && data.exercises.length > 0 ? (
        <WorkoutHeroCard
          focusTitle={deriveFocusTitle(data.exercises)}
          movementCount={data.exercises.length}
          estimatedMinutes={estimateMinutes(data.exercises.length)}
          streak={streakStats}
          canStart={Boolean(canStartWorkout)}
          onStart={() => {
            requirePremium('start_workout', () => void handleStartWorkout());
          }}
        />
      ) : null}

      {!errorMessage && data?.isFuture ? (
        <WorkoutEmptyState
          title="Plan not available yet"
          message="Your personalized workout unlocks on this day. Check back then."
        />
      ) : null}

      {!errorMessage && data?.isReadOnly && !data.isFuture ? (
        <WorkoutReadOnlyBanner
          message={
            data.session?.status === 'completed'
              ? 'This session is complete — view your movements below.'
              : 'Past days are read-only. Focus on today’s session.'
          }
        />
      ) : null}

      {!errorMessage && data && !data.isFuture && data.exercises.length > 0 ? (
        <Text variant="label" style={styles.sectionLabel}>
          Today&apos;s movements
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen title="Workout" isLoading={isLoading} loadingLabel="Loading your plan...">
      {!errorMessage && data && !data.isFuture && data.exercises.length > 0 ? (
        <FlatList
          data={data.exercises}
          keyExtractor={(item) => `${item.exerciseId}-${item.sortOrder}`}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListFooterComponent={
            data.session?.status === 'in_progress' && data.isToday ? (
              <ResumeWorkoutBanner
                exerciseLabel={`exercise ${(data.session.currentExerciseIndex ?? 0) + 1}`}
                onResume={() => router.push(`/(tabs)/workout/player/${data.session!.id}`)}
                onDiscard={async () => {
                  await discardWorkoutSession(data.session!.id);
                  await reload();
                  await reloadCalendar();
                  await reloadStreak();
                }}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <ExerciseGridCard
                item={item}
                disabled={data.isReadOnly && data.session?.status !== 'completed'}
                onPress={() => openExerciseDetail(item.exerciseId, item.sortOrder)}
              />
            </View>
          )}
        />
      ) : (
        <View style={styles.fallback}>{listHeader}</View>
      )}

      {!errorMessage && data && !data.isFuture && data.exercises.length === 0 ? (
        <WorkoutEmptyState
          title="No workout plan"
          message="We couldn’t find exercises for this day. Pull to refresh or try again."
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    gap: spacing.sm,
  },
  headerStack: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionLabel: {
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  gridRow: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  gridItem: {
    flex: 1,
  },
  listContent: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
});
