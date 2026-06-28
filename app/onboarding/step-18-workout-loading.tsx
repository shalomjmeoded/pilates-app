import { format } from 'date-fns';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { seedDatabaseIfNeeded } from '@/db/seed/exerciseSeed';
import { deleteWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { ensureWorkoutPlanForDate } from '@/engines/workout/ensureDailyPlan';
import { colors, radius, spacing } from '@/theme';
import { PlanGenerationError } from '@/types/workout';

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

async function prepareFirstWorkoutPlan(planDate: string): Promise<void> {
  await seedDatabaseIfNeeded();

  try {
    await ensureWorkoutPlanForDate(planDate);
  } catch (error) {
    if (!isRecoverableFirstWorkoutError(error)) {
      throw error;
    }

    console.warn('[BetterMe] Repairing first workout generation state.', error);
    await deleteWorkoutPlanByDate(planDate);
    await seedDatabaseIfNeeded();
    await ensureWorkoutPlanForDate(planDate);
  }
}

export default function Step18WorkoutLoading() {
  const router = useRouter();
  const [progress, setProgress] = useState(0.08);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
    setProgress(0.08);

    intervalRef.current = setInterval(() => {
      if (runId !== runIdRef.current) {
        return;
      }
      setProgress((value) => Math.min(FILL_CAP, value + FILL_STEP));
    }, TICK_MS);

    const startedAt = Date.now();
    try {
      await prepareFirstWorkoutPlan(getTodayPlanDate());
      if (runId !== runIdRef.current) {
        return;
      }

      const remainingMs = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      timeoutRef.current = setTimeout(() => {
        if (runId !== runIdRef.current) {
          return;
        }
        clearTimers();
        setProgress(1);
        router.replace('/(tabs)/workout');
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

        {error ? (
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
});
