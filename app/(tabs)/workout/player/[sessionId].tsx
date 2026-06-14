import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscreenTopBar } from '@/components/navigation';
import { ExerciseMediaView, ExerciseSwapReasonSheet, WorkoutExitSheet } from '@/components/workout';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TuneBootLoader } from '@/components/ui/TuneBootLoader';
import {
  completeWorkoutSession,
  discardWorkoutSession,
  getSessionFeedback,
  saveSessionExerciseFeedback,
  updateSessionProgress,
} from '@/db/repositories/workoutRepository';
import { ensureNextDayPlanAdapted } from '@/engines/workout';
import { useExerciseSubstitution } from '@/hooks/useExerciseSubstitution';
import { usePremium } from '@/hooks/usePremium';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import type { ExerciseFeedback } from '@/types/exercise';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';
import { colors, radius, shadows, spacing } from '@/theme';
import { buildExerciseYouTubeSearchUrl } from '@/utils/exerciseVideo';
import { successNotificationHaptic } from '@/utils/haptics';

export default function WorkoutPlayerScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { session, planDate, exercises, isLoading, error, reload } = useWorkoutSession(sessionId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exitVisible, setExitVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [swapSheetVisible, setSwapSheetVisible] = useState(false);
  const [swapMessage, setSwapMessage] = useState<string | null>(null);
  const [feedbackBySortOrder, setFeedbackBySortOrder] = useState<Record<number, ExerciseFeedback>>(
    {},
  );
  const initialized = useRef(false);
  const { substitute, isSwapping, error: swapError, clearError: clearSwapError } = useExerciseSubstitution(
    planDate ?? '',
  );
  const { requirePremium } = usePremium();

  useEffect(() => {
    if (!session || initialized.current) {
      return;
    }
    setCurrentIndex(session.currentExerciseIndex ?? 0);
    setElapsedSeconds(session.elapsedSeconds ?? 0);
    initialized.current = true;
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let mounted = true;
    const loadFeedback = async () => {
      const feedback = await getSessionFeedback(session.id);
      if (!mounted) {
        return;
      }
      setFeedbackBySortOrder(
        Object.fromEntries(feedback.map((item) => [item.sortOrder, item.feedback])),
      );
    };

    void loadFeedback();

    return () => {
      mounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const persist = () => {
      void updateSessionProgress(session.id, currentIndex, elapsedSeconds);
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        persist();
      }
    });

    return () => {
      persist();
      subscription.remove();
    };
  }, [session, currentIndex, elapsedSeconds]);

  if (isLoading) {
    return <TuneBootLoader message="Opening your session..." />;
  }

  if (error || !session || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SubscreenTopBar />
        <View style={styles.center}>
          <Text variant="h2">Session unavailable</Text>
          <Text variant="bodyMuted" style={styles.copy}>
            {error ?? 'This workout could not be loaded.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const current = exercises[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= exercises.length - 1;
  const prescription = current.holdSeconds
    ? `${current.sets} sets · ${current.holdSeconds}s hold`
    : `${current.sets} sets · ${current.reps ?? '—'} reps`;

  const persistIndex = async (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    await updateSessionProgress(session.id, nextIndex, elapsedSeconds);
  };

  const markCurrentExercise = async (
    feedback: ExerciseFeedback,
    options: { preserveModified?: boolean } = {},
  ) => {
    const existing = feedbackBySortOrder[current.sortOrder];
    if (options.preserveModified && existing === 'modified') {
      return;
    }

    setFeedbackBySortOrder((value) => ({
      ...value,
      [current.sortOrder]: feedback,
    }));
    await saveSessionExerciseFeedback(session.id, current.sortOrder, feedback);
  };

  const handlePrevious = () => {
    if (isFirst) {
      return;
    }
    void persistIndex(currentIndex - 1);
  };

  const finishWorkout = async () => {
    await updateSessionProgress(session.id, currentIndex, elapsedSeconds);
    await completeWorkoutSession(session.id);
    if (planDate) {
      await ensureNextDayPlanAdapted(planDate);
    }
    successNotificationHaptic();
    AccessibilityInfo.announceForAccessibility('Workout completed.');
    router.replace(`/(tabs)/workout/feedback/${session.id}`);
  };

  const handleNext = async () => {
    await markCurrentExercise('completed', { preserveModified: true });
    if (isLast) {
      await finishWorkout();
      return;
    }
    await persistIndex(currentIndex + 1);
  };

  const handleSkip = async () => {
    await markCurrentExercise('skipped');
    if (isLast) {
      await finishWorkout();
      return;
    }
    await persistIndex(currentIndex + 1);
  };

  const handleSelectSwapReason = async (reason: ExerciseSwapReason) => {
    if (!session) {
      return;
    }

    clearSwapError();
    setSwapMessage(null);

    const result = await substitute({
      exercise: current.exercise,
      planId: session.planId,
      planExercise: current,
      reason,
    });

    if (!result) {
      return;
    }

    await markCurrentExercise('modified');
    setSwapMessage(`Switched to ${result.exerciseName}.`);
    setSwapSheetVisible(false);
    await reload();
  };

  const handleResumeLater = async () => {
    await updateSessionProgress(session.id, currentIndex, elapsedSeconds);
    setExitVisible(false);
    router.replace('/(tabs)/workout');
  };

  const handleDiscard = async () => {
    await discardWorkoutSession(session.id);
    setExitVisible(false);
    router.replace('/(tabs)/workout');
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const elapsedLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const completionProgress = ((currentIndex + 1) / exercises.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <SubscreenTopBar
          onPress={() => setExitVisible(true)}
          accessibilityLabel="Exit workout"
        />
        <View
          style={[styles.timerPanel, shadows.card]}
          accessibilityRole="timer"
          accessibilityLabel={`Workout timer, ${minutes} minutes and ${seconds} seconds elapsed`}
        >
          <Text variant="label" style={styles.timerEyebrow}>
            Workout Time
          </Text>
          <Text style={styles.timerValue}>{elapsedLabel}</Text>
          <Text variant="caption" style={styles.exerciseProgress}>
            Exercise {currentIndex + 1} of {exercises.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionProgress}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseMediaView exercise={current.exercise} variant="gif" fillWidth />

        <Text variant="h1" style={styles.title}>
          {current.exercise.name}
        </Text>
        <Text variant="bodyMuted">{titleCase(current.exercise.muscleGroup)}</Text>

        <Text variant="h2" style={styles.prescription}>
          {prescription}
        </Text>

        <View style={styles.instructions}>
          <Text variant="label">Instructions</Text>
          {current.exercise.instructions.map((step, index) => (
            <Text key={`${current.exercise.id}-step-${index}`} variant="body">
              {index + 1}. {step}
            </Text>
          ))}
        </View>

        <Button
          label="Watch Reference Video"
          variant="secondary"
          onPress={() => void Linking.openURL(buildExerciseYouTubeSearchUrl(current.exercise))}
        />

        {swapMessage ? <Text variant="bodyMuted">{swapMessage}</Text> : null}
        {swapError ? <Text variant="body" style={styles.errorText}>{swapError}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.utilityRow}>
          <Button
            label={isPaused ? 'Resume' : 'Pause'}
            variant="secondary"
            onPress={() => setIsPaused((value) => !value)}
            style={styles.compactButton}
            accessibilityLabel={isPaused ? 'Resume workout' : 'Pause workout'}
          />
          <Button
            label={isSwapping ? 'Finding...' : 'Switch'}
            variant="secondary"
            onPress={() => requirePremium('exercise_swap', () => setSwapSheetVisible(true))}
            disabled={isPaused || isSwapping}
            style={styles.compactButton}
            accessibilityLabel="Switch this exercise"
          />
        </View>
        <View style={styles.navigationRow}>
          <Button
            label="Previous"
            variant="secondary"
            onPress={handlePrevious}
            disabled={isFirst || isPaused}
            style={styles.navigationButton}
            accessibilityLabel="Go to previous exercise"
          />
          <Button
            label="Skip"
            variant="secondary"
            onPress={() => void handleSkip()}
            disabled={isPaused}
            style={styles.navigationButton}
            accessibilityLabel="Skip this exercise"
          />
          <Button
            label={isLast ? 'Complete' : 'Next'}
            onPress={() => void handleNext()}
            disabled={isPaused}
            style={styles.navigationButton}
            accessibilityLabel={isLast ? 'Complete workout' : 'Go to next exercise'}
          />
        </View>
      </View>

      <WorkoutExitSheet
        visible={exitVisible}
        onResumeLater={() => void handleResumeLater()}
        onDiscard={() => void handleDiscard()}
        onContinue={() => setExitVisible(false)}
      />

      <ExerciseSwapReasonSheet
        visible={swapSheetVisible}
        isLoading={isSwapping}
        onSelectReason={(reason) => void handleSelectSwapReason(reason)}
        onClose={() => setSwapSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  topBar: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  timerPanel: {
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 176,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  timerEyebrow: {
    color: colors.brandSecondary,
  },
  timerValue: {
    color: colors.brandPrimary,
    fontSize: 46,
    fontWeight: '700',
    lineHeight: 52,
    letterSpacing: 0,
  },
  exerciseProgress: {
    color: colors.textMuted,
  },
  progressTrack: {
    marginHorizontal: spacing.sm,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.brandPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  copy: {
    textAlign: 'center',
  },
  title: {
    marginTop: spacing.xs,
  },
  prescription: {
    color: colors.brandPrimary,
  },
  errorText: {
    color: colors.destructive,
  },
  instructions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  utilityRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navigationRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  compactButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.xs,
  },
  navigationButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 8,
  },
});
