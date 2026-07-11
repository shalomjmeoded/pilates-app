import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import {
  ChangeWorkoutSheet,
  ExerciseGridCard,
  ResumeWorkoutBanner,
  WeekCalendarStrip,
  WorkoutCompletedBanner,
  WorkoutEmptyState,
  WorkoutErrorState,
  WorkoutHeroCard,
  WorkoutReadOnlyBanner,
} from '@/components/workout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { discardWorkoutSession, startWorkoutSession } from '@/db/repositories/workoutRepository';
import { getCalendarDates } from '@/engines/workout';
import {
  deriveWhyThisWorkout,
  deriveWorkoutFocusTitle,
  estimateWorkoutMinutes,
} from '@/engines/workout/workoutPresentation';
import { useWorkoutCalendarCompletion } from '@/hooks/useWorkoutCalendarCompletion';
import { useWorkoutDay } from '@/hooks/useWorkoutDay';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStreak } from '@/hooks/useWorkoutStreak';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutChangeRequest } from '@/types/workout';
import { applyWorkoutChangeRequest } from '@/services/workout/applyWorkoutChangeRequest';
import { warmAiProxy } from '@/services/ai';
import { spacing } from '@/theme';

const DEFAULT_CHANGE_REQUEST: WorkoutChangeRequest = {
  focusArea: 'core',
  targetMinutes: 25,
  intensity: 'balanced',
  coachNote: '',
};

export default function WorkoutScreen() {
  const router = useRouter();
  const selectedDate = useWorkoutStore((state) => state.selectedDate);
  const setSelectedDate = useWorkoutStore((state) => state.setSelectedDate);
  const calendarDates = useMemo(() => getCalendarDates(), []);
  const { data, isLoading, isRefreshing, errorCode, errorMessage, reload } =
    useWorkoutDay(selectedDate);
  const { completedDates, reload: reloadCalendar } = useWorkoutCalendarCompletion(calendarDates);
  const { stats: streakStats, reload: reloadStreak } = useWorkoutStreak();
  const { hasAccess, requirePremium } = usePremium();
  const [changeVisible, setChangeVisible] = useState(false);
  const [changeRequest, setChangeRequest] = useState<WorkoutChangeRequest>(DEFAULT_CHANGE_REQUEST);
  const [isApplyingChange, setIsApplyingChange] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  useEffect(() => {
    if (hasAccess) {
      void warmAiProxy();
    }
  }, [hasAccess]);

  const MIN_STARTABLE_MOVEMENTS = 9;

  const canStartWorkout =
    data?.isToday &&
    !data.isReadOnly &&
    data.plan &&
    data.session?.status !== 'in_progress' &&
    data.session?.status !== 'completed' &&
    data.exercises.length >= MIN_STARTABLE_MOVEMENTS;

  const startUnavailableReason =
    data?.isToday &&
    !data.isReadOnly &&
    data.plan &&
    data.session?.status !== 'in_progress' &&
    data.session?.status !== 'completed' &&
    data.exercises.length > 0 &&
    data.exercises.length < MIN_STARTABLE_MOVEMENTS
      ? `Today's plan has ${data.exercises.length} of the ${MIN_STARTABLE_MOVEMENTS} movements needed for a full session. Use Change Workout to rebuild it.`
      : undefined;

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

  const openChangeSheet = () => {
    setChangeError(null);
    setChangeVisible(true);
  };

  const confirmDiscardSession = () => {
    if (!data?.session) {
      return;
    }
    Alert.alert('Discard this workout?', 'Your completed movements in this session will be cleared.', [
      { text: 'Keep workout', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await discardWorkoutSession(data.session!.id);
            await reload();
            await reloadCalendar();
            await reloadStreak();
          })();
        },
      },
    ]);
  };

  const confirmDiscardAndApplyChange = async () => {
    setIsApplyingChange(true);
    setChangeError(null);

    try {
      const result = await applyWorkoutChangeRequest({
        planDate: selectedDate,
        request: changeRequest,
        todayMovementCount: data?.exercises.length ?? 0,
        todayEstimatedMinutes: estimateWorkoutMinutes(data?.exercises ?? []),
      });
      await reload();
      await reloadCalendar();
      await reloadStreak();
      setChangeVisible(false);
      const remainingMessage =
        result.remainingChangesToday === 1
          ? '\n\nYou can change today’s workout 1 more time.'
          : result.remainingChangesToday === 0
            ? '\n\nYou have reached today’s workout change limit.'
            : '';
      Alert.alert('Workout updated', `${result.coachingRationale}${remainingMessage}`);
    } catch (error) {
      setChangeError(error instanceof Error ? error.message : 'Could not update workout.');
    } finally {
      setIsApplyingChange(false);
    }
  };

  const applyChange = async () => {
    if (!data?.isToday) {
      setChangeError('Workout changes are available only for today.');
      return;
    }

    const runApply = () => {
      requirePremium('start_workout', () => void confirmDiscardAndApplyChange());
    };

    if (data.session?.status === 'in_progress') {
      Alert.alert(
        'Discard current session?',
        'To rebuild today’s workout, discard the in-progress session first.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard and rebuild',
            style: 'destructive',
            onPress: () => {
              const hasPremium = requirePremium('start_workout', () => {});
              if (!hasPremium) {
                return;
              }
              void (async () => {
                await discardWorkoutSession(data.session!.id);
                await confirmDiscardAndApplyChange();
              })();
            },
          },
        ],
      );
      return;
    }

    runApply();
  };

  const listHeader = (
    <View style={styles.headerStack}>
      <WeekCalendarStrip
        dates={calendarDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedDates={completedDates}
      />

      {isRefreshing ? <Text variant="bodyMuted">Updating plan...</Text> : null}

      {errorMessage ? (
        <WorkoutErrorState code={errorCode} message={errorMessage} onRetry={() => void reload()} />
      ) : null}

      {!errorMessage && data?.session?.status === 'in_progress' && data.isToday ? (
        <ResumeWorkoutBanner
          exerciseLabel={`exercise ${(data.session.currentExerciseIndex ?? 0) + 1}`}
          onResume={() => router.push(`/(tabs)/workout/player/${data.session!.id}`)}
          onDiscard={confirmDiscardSession}
        />
      ) : null}

      {!errorMessage && data && !data.isFuture && data.exercises.length > 0 ? (
        <>
          {data.session?.status === 'completed' && data.isToday ? (
            <WorkoutCompletedBanner
              movementCount={data.exercises.length}
              streakDays={streakStats?.currentStreak}
            />
          ) : (
            <WorkoutHeroCard
              focusTitle={deriveWorkoutFocusTitle(data.exercises)}
              whyThisWorkout={deriveWhyThisWorkout(data.exercises)}
              movementCount={data.exercises.length}
              estimatedMinutes={estimateWorkoutMinutes(data.exercises)}
              streak={streakStats}
              canStart={Boolean(canStartWorkout)}
              startUnavailableReason={startUnavailableReason}
              onChangeWorkout={data.isToday && !data.isReadOnly ? openChangeSheet : undefined}
              onStart={() => {
                requirePremium('start_workout', () => void handleStartWorkout());
              }}
            />
          )}
        </>
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
    <Screen title="Workout" subtitle="Your daily movement, guided." isLoading={isLoading} loadingLabel="Loading your plan..." showBrandMark>
      {!errorMessage && data && !data.isFuture && data.exercises.length > 0 ? (
        <FlatList
          data={data.exercises}
          keyExtractor={(item) => `${item.exerciseId}-${item.sortOrder}`}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
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
          actionLabel="Try again"
          onAction={() => void reload()}
        />
      ) : null}

      <ChangeWorkoutSheet
        visible={changeVisible}
        value={changeRequest}
        isApplying={isApplyingChange}
        applyError={changeError}
        onChange={setChangeRequest}
        onApply={() => void applyChange()}
        onClose={() => setChangeVisible(false)}
      />
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
