import { parseISO } from 'date-fns';

import { getRecentDailyTotals } from '@/db/repositories/nutritionRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getAllWeightLogs } from '@/db/repositories/weightLogRepository';
import {
  getCompletedWorkoutDatesBetween,
  getPlannedWorkoutDatesBetween,
  getRecentSkipCounts,
} from '@/db/repositories/workoutRepository';
import { getExerciseById } from '@/db/repositories/exerciseRepository';
import {
  getWeeklyCoachInsight,
  upsertWeeklyCoachInsight,
} from '@/db/repositories/coachingRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { buildWeeklyCoachSummary } from '@/engines/coaching/buildWeeklyCoachSummary';
import {
  getPreviousWeekStartDate,
  getWeekEndDate,
  getWeekStartDate,
  isWeekStartDay,
} from '@/engines/coaching/weekStart';
import { aiFacade } from '@/services/ai';
import { getCurrentPremiumStatus } from '@/services/monetization/currentPremiumStatus';
import { notifyWeeklyCoachReady } from '@/services/notifications/notificationService';
import { ensureWeeklyTargetAdjustment } from '@/services/coaching/weeklyTargetAdjustmentService';
import type { WeeklyCoachInsightContent, WeeklyCoachSummary } from '@/types/coaching';

async function resolveSkippedExerciseNames(withinDays: number): Promise<string[]> {
  const skipCounts = await getRecentSkipCounts(withinDays);
  const sorted = Object.entries(skipCounts).sort((a, b) => b[1] - a[1]);

  const names: string[] = [];
  for (const [exerciseId] of sorted.slice(0, 3)) {
    const exercise = await getExerciseById(exerciseId);
    if (exercise?.name) {
      names.push(exercise.name);
    }
  }
  return names;
}

export async function loadWeeklyCoachSummary(): Promise<WeeklyCoachSummary> {
  const profile = await getProfile();
  const reviewWeekStart = getPreviousWeekStartDate();
  const reviewWeekEnd = getWeekEndDate(reviewWeekStart);

  const [nutritionRows, weightLogs, skippedExerciseNames, plannedDates, completedDates] =
    await Promise.all([
      getRecentDailyTotals(7),
      getAllWeightLogs(),
      resolveSkippedExerciseNames(7),
      getPlannedWorkoutDatesBetween(reviewWeekStart, reviewWeekEnd),
      getCompletedWorkoutDatesBetween(reviewWeekStart, reviewWeekEnd),
    ]);

  return buildWeeklyCoachSummary({
    nutritionRows,
    workoutsCompleted: completedDates.length,
    workoutsPlanned: plannedDates.length,
    weightLogs,
    skippedExerciseNames,
    goal: profile?.fitnessGoal ?? 'maintain',
    referenceDate: parseISO(`${reviewWeekStart}T12:00:00`),
  });
}

function toStoredInsight(
  aiInsight: {
    summary: string;
    wins: string[];
    focusForNextWeek: string;
    nutritionTip: string;
    workoutTip: string;
  },
  source: 'ai' | 'local',
): WeeklyCoachInsightContent {
  return {
    ...aiInsight,
    source,
    generatedAt: new Date().toISOString(),
  };
}

export async function getCachedWeeklyCoachInsight(): Promise<WeeklyCoachInsightContent | null> {
  const weekStart = getWeekStartDate();
  const row = await getWeeklyCoachInsight(weekStart);
  return row?.payload.weeklyCoach ?? null;
}

function cachedMatchesSummary(
  input: WeeklyCoachSummary | null | undefined,
  summary: WeeklyCoachSummary,
): boolean {
  if (!input) {
    return false;
  }
  return (
    input.workoutsPlanned === summary.workoutsPlanned &&
    input.workoutsCompleted === summary.workoutsCompleted
  );
}

export async function generateWeeklyCoachInsight(options?: {
  notify?: boolean;
}): Promise<WeeklyCoachInsightContent> {
  const weekStart = getWeekStartDate();
  const onWeekStart = isWeekStartDay();

  if (!onWeekStart) {
    const cachedEarly = await getCachedWeeklyCoachInsight();
    if (cachedEarly) {
      return cachedEarly;
    }
    throw new Error(
      'Weekly coach unlocks on the first day of your week. You can change that day in Settings when available.',
    );
  }

  const summary = await loadWeeklyCoachSummary();
  const cached = await getCachedWeeklyCoachInsight();
  const row = cached ? await getWeeklyCoachInsight(weekStart) : null;
  const cachedInput = row?.payload.weeklyCoachInput;

  if (cached && cachedMatchesSummary(cachedInput, summary)) {
    return cached;
  }

  const adjustment = await ensureWeeklyTargetAdjustment({ weekStart });
  const premium = await getCurrentPremiumStatus();

  if (!hasPremiumAccess(premium)) {
    throw new Error('Weekly AI coach requires BetterMe Premium.');
  }

  let insight: WeeklyCoachInsightContent;
  try {
    const aiResult = await aiFacade.generateWeeklyCoach(summary);
    insight = toStoredInsight(aiResult, 'ai');
  } catch {
    const { buildLocalWeeklyCoachFallback } = await import(
      '@/engines/coaching/buildLocalWeeklyCoachFallback'
    );
    insight = buildLocalWeeklyCoachFallback(summary);
  }

  if (adjustment) {
    insight = {
      ...insight,
      targetAdjustmentSummary: adjustment.message,
      nutritionTip: `${adjustment.message} ${insight.nutritionTip}`.trim(),
    };
  }

  await upsertWeeklyCoachInsight(weekStart, insight, summary);

  if (options?.notify !== false) {
    await notifyWeeklyCoachReady(insight.summary);
  }

  return insight;
}
