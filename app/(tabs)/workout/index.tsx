import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import {
  ChangeWorkoutSheet,
  ExerciseGridCard,
  RestDayCard,
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
import {
  discardWorkoutSession,
  restartWorkoutSessionForDev,
  startWorkoutSession,
} from '@/db/repositories/workoutRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import {
  ensureWeekWorkoutPlans,
  formatPlanDate,
  getDayScheduleOverride,
  getScheduledWorkoutDatesForWeek,
  getWeekCalendarDates,
  setDayScheduleOverride,
} from '@/engines/workout';
import {
  deriveWhyThisWorkout,
  deriveWorkoutFocusTitle,
  estimateWorkoutMinutes,
} from '@/engines/workout/workoutPresentation';
import { useWorkoutCalendarCompletion } from '@/hooks/useWorkoutCalendarCompletion';
import { useWorkoutDay } from '@/hooks/useWorkoutDay';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutStreak } from '@/hooks/useWorkoutStreak';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { TrainingFrequency } from '@/types/profile';
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

const MAX_WEEK_OFFSET = 4;
const MIN_WEEK_OFFSET = -8;

export default function WorkoutScreen() {
  const router = useRouter();
  const selectedDate = useWorkoutStore((state) => state.selectedDate);
  const setSelectedDate = useWorkoutStore((state) => state.setSelectedDate);
  const weekStartsOn = usePreferencesStore((state) => state.preferences.weekStartsOn);
  const [weekOffset, setWeekOffset] = useState(0);
  const [trainingFrequency, setTrainingFrequency] = useState<TrainingFrequency | null>(null);
  const [isEnsuringWeek, setIsEnsuringWeek] = useState(false);
  const [scheduleRevision, setScheduleRevision] = useState(0);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);

  const calendarDates = useMemo(
    () => getWeekCalendarDates(weekOffset, weekStartsOn),
    [weekOffset, weekStartsOn],
  );

  const weekStart = calendarDates[0];
  const weekLabel = useMemo(() => {
    if (!weekStart || !calendarDates[6]) {
      return 'This week';
    }
    if (weekOffset === 0) {
      return 'This week';
    }
    const start = format(parseISO(weekStart), 'MMM d');
    const end = format(parseISO(calendarDates[6]), 'MMM d');
    return `${start} – ${end}`;
  }, [calendarDates, weekOffset, weekStart]);

  const restDates = useMemo(() => {
    if (!weekStart || !trainingFrequency) {
      return new Set<string>();
    }
    const workoutDates = new Set(getScheduledWorkoutDatesForWeek(weekStart, trainingFrequency));
    const today = formatPlanDate(new Date());
    const todayOverride = getDayScheduleOverride(today);
    if (todayOverride === 'workout') {
      workoutDates.add(today);
    } else if (todayOverride === 'rest') {
      workoutDates.delete(today);
    }
    return new Set(calendarDates.filter((date) => !workoutDates.has(date)));
  }, [calendarDates, trainingFrequency, weekStart, scheduleRevision]);

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
    void getProfile().then((profile) => {
      setTrainingFrequency(profile?.trainingFrequency ?? null);
    });
  }, []);

  useEffect(() => {
    if (!weekStart) {
      return;
    }

    let cancelled = false;
    setIsEnsuringWeek(true);
    void ensureWeekWorkoutPlans(weekStart)
      .then(() => {
        if (cancelled) {
          return;
        }
        void reload();
        void reloadCalendar();
      })
      .finally(() => {
        if (!cancelled) {
          setIsEnsuringWeek(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // Pre-generate once per visible week; reload helpers intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- weekStart drives schedule generation
  }, [weekStart, weekOffset, weekStartsOn]);

  useEffect(() => {
    if (calendarDates.length === 0) {
      return;
    }
    if (!calendarDates.includes(selectedDate)) {
      const today = formatPlanDate(new Date());
      setSelectedDate(calendarDates.includes(today) ? today : calendarDates[0]);
    }
  }, [calendarDates, selectedDate, setSelectedDate]);

  useEffect(() => {
    if (hasAccess) {
      void warmAiProxy();
    }
  }, [hasAccess]);

  const MIN_STARTABLE_MOVEMENTS = 9;

  const canStartWorkout =
    data?.isToday &&
    !data.isRestDay &&
    !data.isReadOnly &&
    data.plan &&
    data.session?.status !== 'in_progress' &&
    data.session?.status !== 'completed' &&
    data.exercises.length >= MIN_STARTABLE_MOVEMENTS;

  const startUnavailableReason =
    data?.isToday &&
    !data.isRestDay &&
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

  const handleRestartDev = () => {
    if (!__DEV__ || !data?.plan) {
      return;
    }
    Alert.alert('Restart workout (dev)', 'Clear this completed session and start again?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const session = await restartWorkoutSessionForDev(data.plan!.id);
            await reload();
            await reloadCalendar();
            await reloadStreak();
            router.push(`/(tabs)/workout/player/${session.id}`);
          })();
        },
      },
    ]);
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

  const handleAddWorkoutOnRestDay = () => {
    if (!data?.isToday || !data.isRestDay) {
      return;
    }
    Alert.alert('Add a workout today?', 'We’ll build a session for today. Your usual weekly pattern stays the same.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add workout',
        onPress: () => {
          void (async () => {
            setIsAddingWorkout(true);
            try {
              setDayScheduleOverride(selectedDate, 'workout');
              setScheduleRevision((value) => value + 1);
              await reload();
              await reloadCalendar();
            } finally {
              setIsAddingWorkout(false);
            }
          })();
        },
      },
    ]);
  };

  const handleTakeRestDay = () => {
    if (!data?.isToday || data.isRestDay) {
      return;
    }
    if (data.session?.status === 'completed' || data.session?.status === 'in_progress') {
      return;
    }
    Alert.alert('Take a rest day?', 'Today becomes a rest day. Your usual weekly pattern stays the same.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Rest today',
        onPress: () => {
          setDayScheduleOverride(selectedDate, 'rest');
          setScheduleRevision((value) => value + 1);
          void reload();
          void reloadCalendar();
        },
      },
    ]);
  };

  const canTakeRestDay =
    Boolean(data?.isToday) &&
    !data?.isRestDay &&
    !data?.isReadOnly &&
    data?.session?.status !== 'completed' &&
    data?.session?.status !== 'in_progress';

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

  const showExerciseList = Boolean(
    !errorMessage && data && !data.isRestDay && data.exercises.length > 0,
  );

  const listHeader = (
    <View style={styles.headerStack}>
      <WeekCalendarStrip
        dates={calendarDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        completedDates={completedDates}
        restDates={restDates}
        weekLabel={weekLabel}
        onPreviousWeek={() => setWeekOffset((value) => Math.max(MIN_WEEK_OFFSET, value - 1))}
        onNextWeek={() => setWeekOffset((value) => Math.min(MAX_WEEK_OFFSET, value + 1))}
        canGoPrevious={weekOffset > MIN_WEEK_OFFSET}
        canGoNext={weekOffset < MAX_WEEK_OFFSET}
      />

      {isRefreshing || isEnsuringWeek ? <Text variant="bodyMuted">Updating plan...</Text> : null}

      {errorMessage ? (
        <WorkoutErrorState code={errorCode} message={errorMessage} onRetry={() => void reload()} />
      ) : null}

      {!errorMessage && data?.isRestDay ? (
        <RestDayCard
          isToday={data.isToday}
          onAddWorkout={data.isToday ? handleAddWorkoutOnRestDay : undefined}
          isAddingWorkout={isAddingWorkout}
        />
      ) : null}

      {!errorMessage && data?.session?.status === 'in_progress' && data.isToday && !data.isRestDay ? (
        <ResumeWorkoutBanner
          exerciseLabel={`exercise ${(data.session.currentExerciseIndex ?? 0) + 1}`}
          onResume={() => router.push(`/(tabs)/workout/player/${data.session!.id}`)}
          onDiscard={confirmDiscardSession}
        />
      ) : null}

      {!errorMessage && data && !data.isRestDay && data.exercises.length > 0 ? (
        <>
          {data.session?.status === 'completed' && data.isToday ? (
            <WorkoutCompletedBanner
              movementCount={data.exercises.length}
              streakDays={streakStats?.currentStreak}
              onRestartDev={__DEV__ ? handleRestartDev : undefined}
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
              onTakeRestDay={canTakeRestDay ? handleTakeRestDay : undefined}
              onStart={() => {
                requirePremium('start_workout', () => void handleStartWorkout());
              }}
            />
          )}
        </>
      ) : null}

      {!errorMessage && data?.isFuture && !data.isRestDay && data.exercises.length === 0 ? (
        <WorkoutEmptyState
          title="Plan not available yet"
          message="Your personalized workout unlocks on this day. Check back then."
        />
      ) : null}

      {!errorMessage && data?.isFuture && !data.isRestDay && data.exercises.length > 0 ? (
        <WorkoutReadOnlyBanner message="Preview only — this workout unlocks on this day." />
      ) : null}

      {!errorMessage && data?.isReadOnly && !data.isFuture && !data.isRestDay ? (
        <WorkoutReadOnlyBanner
          message={
            data.session?.status === 'completed'
              ? 'This session is complete — view your movements below.'
              : 'Past days are read-only. Focus on today’s session.'
          }
        />
      ) : null}

      {!errorMessage && data && !data.isRestDay && data.exercises.length > 0 ? (
        <Text variant="label" style={styles.sectionLabel}>
          {data.isToday ? "Today's movements" : 'Movements'}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen
      title="Workout"
      subtitle="Your weekly movement, guided."
      isLoading={isLoading}
      loadingLabel="Loading your plan..."
      showBrandMark
    >
      {showExerciseList ? (
        <FlatList
          data={data!.exercises}
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
                disabled={data!.isReadOnly && data!.session?.status !== 'completed'}
                onPress={() => openExerciseDetail(item.exerciseId, item.sortOrder)}
              />
            </View>
          )}
        />
      ) : (
        <View style={styles.fallback}>{listHeader}</View>
      )}

      {!errorMessage && data && !data.isRestDay && !data.isFuture && data.exercises.length === 0 ? (
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
