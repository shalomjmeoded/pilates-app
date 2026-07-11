import { format } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { seedDatabaseIfNeeded } from '@/db/seed/exerciseSeed';
import { deleteWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { startWorkoutSession } from '@/db/repositories/workoutRepository';
import { ensureWorkoutPlanForDate } from '@/engines/workout/ensureDailyPlan';
import { loadWorkoutDay } from '@/engines/workout';
import {
  deriveWorkoutFocusTitle,
  estimateWorkoutMinutes,
} from '@/engines/workout/workoutPresentation';
import { colors, radius, spacing } from '@/theme';
import { PlanGenerationError, type WorkoutPlan } from '@/types/workout';
import { captureProductEvent, getElapsedOnboardingSeconds } from '@/services/analytics/analyticsCore';
import { successNotificationHaptic } from '@/utils/haptics';

const MIN_VISIBLE_MS = 1800;
const TICK_MS = 260;
const FILL_STEP = 0.035;
const FILL_CAP = 0.9;

function getTodayPlanDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function isRecoverableFirstWorkoutError(error: unknown): boolean {
  if (error instanceof PlanGenerationError) {
    return error.code !== 'NO_PROFILE';
  }

  const message = error instanceof Error ? error.message : String(error);
  return /FOREIGN KEY constraint failed|unknown exercises|outside the seeded library|exercise library/i.test(
    message,
  );
}

async function prepareFirstWorkoutPlan(planDate: string): Promise<WorkoutPlan> {
  await seedDatabaseIfNeeded();

  try {
    return await ensureWorkoutPlanForDate(planDate);
  } catch (error) {
    if (!isRecoverableFirstWorkoutError(error)) {
      throw error;
    }

    console.warn('[BetterMe] Repairing first workout generation state.', error);
    await deleteWorkoutPlanByDate(planDate);
    await seedDatabaseIfNeeded();
    return await ensureWorkoutPlanForDate(planDate);
  }
}

interface ReadyWorkout {
  planId: string;
  focusTitle: string;
  movementCount: number;
  estimatedMinutes: number;
}

export default function Step18WorkoutLoading() {
  const router = useRouter();
  const [progress, setProgress] = useState(0.08);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [readyWorkout, setReadyWorkout] = useState<ReadyWorkout | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const statusLabel = useMemo(() => {
    if (progress < 0.34) {
      return 'Reading your goals';
    }
    if (progress < 0.68) {
      return 'Designing your first workout';
    }
    return 'Finalizing your plan';
  }, [progress]);

  const runGeneration = useCallback(async () => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    clearTimers();
    setError(null);
    setIsGenerating(true);
    setReadyWorkout(null);
    setProgress(0.08);

    intervalRef.current = setInterval(() => {
      if (runId !== runIdRef.current) {
        return;
      }
      setProgress((value) => Math.min(FILL_CAP, value + FILL_STEP));
    }, TICK_MS);

    const startedAt = Date.now();
    try {
      const planDate = getTodayPlanDate();
      const plan = await prepareFirstWorkoutPlan(planDate);
      const day = await loadWorkoutDay(planDate);
      if (runId !== runIdRef.current) {
        return;
      }

      const ready: ReadyWorkout = {
        planId: plan.id,
        focusTitle: deriveWorkoutFocusTitle(day.exercises),
        movementCount: day.exercises.length,
        estimatedMinutes: estimateWorkoutMinutes(day.exercises),
      };

      const remainingMs = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      timeoutRef.current = setTimeout(() => {
        if (runId !== runIdRef.current) {
          return;
        }
        clearTimers();
        setProgress(1);
        setReadyWorkout(ready);
        successNotificationHaptic();
        captureProductEvent('first workout ready', {
          elapsed_onboarding_seconds: getElapsedOnboardingSeconds(),
        });
      }, remainingMs);
    } catch (generationError) {
      if (runId !== runIdRef.current) {
        return;
      }
      clearTimers();
      setProgress(0);
      console.warn('[BetterMe] First workout generation failed.', generationError);
      setError('Could not prepare your workout yet. Please try again.');
    } finally {
      if (runId === runIdRef.current) {
        setIsGenerating(false);
      }
    }
  }, [clearTimers, router]);

  const startFirstWorkout = async () => {
    if (!readyWorkout || isStarting) {
      return;
    }
    setIsStarting(true);
    try {
      const session = await startWorkoutSession(readyWorkout.planId);
      captureProductEvent('first workout started', {
        elapsed_onboarding_seconds: getElapsedOnboardingSeconds(),
      });
      router.replace(`/(tabs)/workout/player/${session.id}`);
    } catch {
      setError('Your workout is ready, but it could not start yet. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => subscription.remove();
    }, []),
  );

  useEffect(() => {
    void runGeneration();
    return () => {
      runIdRef.current += 1;
      clearTimers();
    };
  }, [clearTimers, runGeneration]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {readyWorkout ? (
          <View style={styles.readyCard}>
            <View style={styles.readyIcon}>
              <Text variant="h2" style={styles.readyIconText}>✓</Text>
            </View>
            <Text variant="label" style={styles.readyEyebrow}>Your first session is ready</Text>
            <Text variant="h1" style={styles.title}>{readyWorkout.focusTitle}</Text>
            <View style={styles.readyMeta}>
              <Text variant="body">{readyWorkout.movementCount} movements</Text>
              <Text variant="bodyMuted">·</Text>
              <Text variant="body">About {readyWorkout.estimatedMinutes} min</Text>
            </View>
            <Text variant="bodyMuted" style={styles.subtitle}>
              Start now, or review the full movement list first.
            </Text>
            <View style={styles.readyActions}>
              <Button
                label={isStarting ? 'Starting...' : 'Start my first workout'}
                onPress={() => void startFirstWorkout()}
                disabled={isStarting}
              />
              <Button
                label="View my plan"
                variant="secondary"
                onPress={() => router.replace('/(tabs)/workout')}
              />
            </View>
            {error ? <Text variant="body" style={styles.error}>{error}</Text> : null}
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <ActivityIndicator size="small" color={colors.brandPrimary} />
              <Text variant="h1" style={styles.title}>
                Building your first session
              </Text>
              <Text variant="bodyMuted" style={styles.subtitle}>
                {error ? 'We hit a delay. Retry in one tap.' : statusLabel}
              </Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </>
        )}

        {error && !readyWorkout ? (
          <>
            <Text variant="body" style={styles.error}>
              {error}
            </Text>
            <Button
              label={isGenerating ? 'Retrying...' : 'Try again'}
              onPress={() => void runGeneration()}
              disabled={isGenerating}
            />
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  track: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  error: {
    color: colors.destructive,
    textAlign: 'center',
  },
  readyCard: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.hero,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceCanvas,
    padding: spacing.md,
  },
  readyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECF9F1',
    borderWidth: 1,
    borderColor: '#BFE8CD',
  },
  readyIconText: {
    color: colors.success,
  },
  readyEyebrow: {
    color: colors.brandPrimary,
  },
  readyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  readyActions: {
    width: '100%',
    gap: spacing.xs,
  },
});
