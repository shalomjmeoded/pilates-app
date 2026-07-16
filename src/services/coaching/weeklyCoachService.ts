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
import { hasPremiumAccess, trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import { buildWeeklyCoachSummary } from '@/engines/coaching/buildWeeklyCoachSummary';
import {
  computeWeeklyCoachReadiness,
  type WeeklyCoachReadiness,
} from '@/engines/coaching/weeklyCoachReadiness';
import {
  getPreviousWeekStartDate,
  getWeekEndDate,
  getWeekStartDate,
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

async function loadReviewWeekContext(): Promise<{
  summary: WeeklyCoachSummary;
  readiness: WeeklyCoachReadiness;
}> {
  const profile = await getProfile();
  const reviewWeekStart = getPreviousWeekStartDate();
  const reviewWeekEnd = getWeekEndDate(reviewWeekStart);

  const [nutritionRows, weightLogs, skippedExerciseNames, plannedDates, completedDates] =
    await Promise.all([
      getRecentDailyTotals(21),
      getAllWeightLogs(),
      resolveSkippedExerciseNames(14),
      getPlannedWorkoutDatesBetween(reviewWeekStart, reviewWeekEnd),
      getCompletedWorkoutDatesBetween(reviewWeekStart, reviewWeekEnd),
    ]);

  const weekNutrition = nutritionRows.filter(
    (row) => row.mealDate >= reviewWeekStart && row.mealDate <= reviewWeekEnd,
  );
  const weekWeights = weightLogs.filter((log) => {
    const day = log.loggedAt.slice(0, 10);
    return day >= reviewWeekStart && day <= reviewWeekEnd;
  });

  const frequencyPlanned = profile
    ? trainingFrequencyToWorkoutsPerWeek(profile.trainingFrequency)
    : 0;
  const workoutsPlanned = plannedDates.length > 0 ? plannedDates.length : frequencyPlanned;

  const readiness = computeWeeklyCoachReadiness({
    reviewWeekStart,
    reviewWeekEnd,
    weightLogs: weekWeights,
    nutritionRows: weekNutrition,
    workoutsCompleted: completedDates.length,
    workoutsPlanned,
  });

  const summary = buildWeeklyCoachSummary({
    nutritionRows: weekNutrition,
    workoutsCompleted: completedDates.length,
    workoutsPlanned,
    weightLogs: weekWeights,
    skippedExerciseNames,
    goal: profile?.fitnessGoal ?? 'maintain',
    referenceDate: parseISO(`${reviewWeekStart}T12:00:00`),
  });

  return { summary, readiness };
}

export async function loadWeeklyCoachSummary(): Promise<WeeklyCoachSummary> {
  const { summary } = await loadReviewWeekContext();
  return summary;
}

export async function loadWeeklyCoachReadiness(): Promise<WeeklyCoachReadiness> {
  const { readiness } = await loadReviewWeekContext();
  return readiness;
}

function toStoredInsight(
  aiInsight: {
    summary: string;
    wins: string[];
    focusForNextWeek: string;
    nutritionTip: string;
    weightTip: string;
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
    input.workoutsCompleted === summary.workoutsCompleted &&
    input.calorieAdherencePercent === summary.calorieAdherencePercent &&
    input.proteinAdherencePercent === summary.proteinAdherencePercent
  );
}

export async function generateWeeklyCoachInsight(options?: {
  notify?: boolean;
}): Promise<WeeklyCoachInsightContent> {
  const weekStart = getWeekStartDate();

  const { summary, readiness } = await loadReviewWeekContext();

  if (!readiness.unlocked) {
    throw new Error(
      `Weekly AI Coach unlocks at ${readiness.unlockThreshold}% logging. You’re at ${readiness.overallPercent}% — keep logging weight, meals, and sessions.`,
    );
  }

  const cached = await getCachedWeeklyCoachInsight();
  const row = cached ? await getWeeklyCoachInsight(weekStart) : null;
  const cachedInput = row?.payload.weeklyCoachInput;

  if (cached && cached.source === 'ai' && cachedMatchesSummary(cachedInput, summary)) {
    return cached;
  }

  const adjustment = await ensureWeeklyTargetAdjustment({ weekStart });
  const premium = await getCurrentPremiumStatus();

  if (!hasPremiumAccess(premium)) {
    throw new Error('Weekly AI coach requires Pilates at Home Premium.');
  }

  let insight: WeeklyCoachInsightContent;
  try {
    const aiResult = await aiFacade.generateWeeklyCoach(summary);
    insight = toStoredInsight(aiResult, 'ai');
  } catch {
    throw new Error(
      'Your coach is ready, but AI feedback couldn’t be reached. Check your connection and try again.',
    );
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
