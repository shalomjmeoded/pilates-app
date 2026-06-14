import { getRecentDailyTotals } from '@/db/repositories/nutritionRepository';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getAllWeightLogs } from '@/db/repositories/weightLogRepository';
import {
  countCompletedWorkoutsInLastDays,
  countPlannedWorkoutDaysInLastDays,
  getRecentSkipCounts,
} from '@/db/repositories/workoutRepository';
import { getExerciseById } from '@/db/repositories/exerciseRepository';
import {
  getWeeklyCoachInsight,
  upsertWeeklyCoachInsight,
} from '@/db/repositories/coachingRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { buildWeeklyCoachSummary } from '@/engines/coaching/buildWeeklyCoachSummary';
import { getWeekStartDate } from '@/engines/coaching/weekStart';
import { aiFacade } from '@/services/ai';
import { notifyWeeklyCoachReady } from '@/services/notifications/notificationService';
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
  const [nutritionRows, weightLogs, skippedExerciseNames] = await Promise.all([
    getRecentDailyTotals(7),
    getAllWeightLogs(),
    resolveSkippedExerciseNames(7),
  ]);

  return buildWeeklyCoachSummary({
    nutritionRows,
    workoutsCompleted: await countCompletedWorkoutsInLastDays(7),
    workoutsPlanned: await countPlannedWorkoutDaysInLastDays(7),
    weightLogs,
    skippedExerciseNames,
    goal: profile?.fitnessGoal ?? 'maintain',
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

export async function generateWeeklyCoachInsight(options?: {
  notify?: boolean;
}): Promise<WeeklyCoachInsightContent> {
  const weekStart = getWeekStartDate();
  const cached = await getCachedWeeklyCoachInsight();
  if (cached) {
    return cached;
  }

  const summary = await loadWeeklyCoachSummary();
  const premium = await getPremiumStatus();

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

  await upsertWeeklyCoachInsight(weekStart, insight, summary);

  if (options?.notify !== false) {
    await notifyWeeklyCoachReady(insight.summary);
  }

  return insight;
}
