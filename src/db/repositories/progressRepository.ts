import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

import { getRecentDailyTotals, countMeals } from '@/db/repositories/nutritionRepository';
import {
  getUnlockedMilestones,
  unlockMilestones,
} from '@/db/repositories/milestoneRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getLatestPhysiqueAssessment } from '@/db/repositories/physiqueAssessmentRepository';
import { upsertCoachingInsight, getCoachingInsightForDate } from '@/db/repositories/coachingRepository';
import {
  countCompletedWorkouts,
  countCompletedWorkoutsInLastDays,
  countPlannedWorkoutDaysInLastDays,
  getCompletedWorkoutDatesBetween,
  getPlannedWorkoutDatesBetween,
} from '@/db/repositories/workoutRepository';
import {
  countWeightLogDaysInLast,
  countWeightLogs,
  getAllWeightLogs,
} from '@/db/repositories/weightLogRepository';
import { getDatabase } from '@/db/connection';
import { calculateBmr, calculateTdee } from '@/engines/calculations';
import { midpointBodyFatPercent } from '@/engines/physique/bodyFatAssumptions';
import { buildCoachingInsights } from '@/engines/coaching';
import {
  buildAdherenceMetrics,
  buildBmiInfo,
  buildGoalProjection,
  buildMilestoneStatuses,
  buildWeightJourney,
  calculateConsistencyScore,
  calculateWeightStreakStats,
  buildWeightTrendAverages,
  evaluateMilestones,
} from '@/engines/progress';
import { buildWorkoutStreakStats, monthPrefix } from '@/engines/workout/streaks';
import type { ProgressDashboardData } from '@/types/progress';

async function getOnboardingCompletedAt(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ completed_at: string }>(
    'SELECT completed_at FROM onboarding_answers WHERE id = 1',
  );
  return row?.completed_at ?? null;
}

function daysSince(dateIso: string | null | undefined): number {
  if (!dateIso) {
    return 0;
  }
  return Math.max(0, differenceInCalendarDays(new Date(), parseISO(dateIso.replace(' ', 'T'))));
}

export async function loadProgressDashboard(): Promise<ProgressDashboardData> {
  const profile = await getProfile();
  if (!profile) {
    throw new Error('Complete onboarding to view progress.');
  }

  const weightLogs = await getAllWeightLogs();
  const nutritionRows = await getRecentDailyTotals(7);
  const adherence = buildAdherenceMetrics(nutritionRows, 7);

  const journey =
    weightLogs.length > 0 || profile.currentWeightKg
      ? buildWeightJourney(
          weightLogs,
          profile.currentWeightKg,
          profile.currentWeightKg,
          profile.goalWeightKg,
        )
      : null;

  const currentWeight = journey?.currentWeightKg ?? profile.currentWeightKg;
  const goalProjection = buildGoalProjection(
    weightLogs,
    currentWeight,
    profile.goalWeightKg,
    profile.paceKgPerWeek,
  );

  const latestPhysique = await getLatestPhysiqueAssessment();
  const bodyFatPercent = latestPhysique
    ? midpointBodyFatPercent(latestPhysique.estimatedBodyFatRange)
    : undefined;

  const { bmr, formula: bmrFormula } = calculateBmr({
    genderIdentity: profile.genderIdentity,
    weightKg: currentWeight,
    heightCm: profile.heightCm,
    birthYear: profile.birthYear,
    bodyFatPercent,
  });
  const { tdee } = calculateTdee(bmr, profile.trainingFrequency);

  const consistency = calculateConsistencyScore({
    completedWorkoutsLast7Days: await countCompletedWorkoutsInLastDays(7),
    plannedWorkoutDaysLast7: await countPlannedWorkoutDaysInLastDays(7),
    nutritionRows,
    weightLogDaysLast7: await countWeightLogDaysInLast(7),
  });

  const onboardingCompletedAt = await getOnboardingCompletedAt();
  const profileCreatedAt = profile.createdAt ?? null;
  const daysSinceOnboarding = Math.max(
    daysSince(onboardingCompletedAt),
    daysSince(profileCreatedAt),
  );

  const unlocked = await getUnlockedMilestones();
  const unlockedKeys = new Set(unlocked.map((item) => item.key));

  const newlyUnlocked = evaluateMilestones({
    weightLogCount: await countWeightLogs(),
    completedWorkoutCount: await countCompletedWorkouts(),
    mealCount: await countMeals(),
    daysSinceOnboarding,
    unlockedKeys,
  });

  if (newlyUnlocked.length > 0) {
    await unlockMilestones(newlyUnlocked);
  }

  const milestones = buildMilestoneStatuses(
    newlyUnlocked.length > 0 ? await getUnlockedMilestones() : unlocked,
  );

  const rangeStart = format(subDays(new Date(), 90), 'yyyy-MM-dd');
  const rangeEnd = format(new Date(), 'yyyy-MM-dd');
  const completedDates = await getCompletedWorkoutDatesBetween(rangeStart, rangeEnd);
  const plannedDates = await getPlannedWorkoutDatesBetween(rangeStart, rangeEnd);
  const workoutStreak = buildWorkoutStreakStats(completedDates, plannedDates, monthPrefix());

  const weightStreak = calculateWeightStreakStats(weightLogs.map((log) => log.loggedAt));
  const weightTrends = buildWeightTrendAverages(weightLogs);

  const today = format(new Date(), 'yyyy-MM-dd');
  let coachingTip =
    (await getCoachingInsightForDate(today))?.dailyTip ??
    'Small daily actions build lasting momentum.';

  if (profile.nutritionMode !== 'workouts_only') {
    const insight = buildCoachingInsights({
      nutritionRows,
      completedWorkoutsThisWeek: await countCompletedWorkoutsInLastDays(7),
      weightLogs,
      insightDate: today,
    });
    await upsertCoachingInsight(insight);
    coachingTip = insight.dailyTip;
  }

  return {
    journey,
    goalWeightKg: profile.goalWeightKg,
    nutritionMode: profile.nutritionMode,
    weightLogs,
    adherence,
    consistency,
    bmi: buildBmiInfo(currentWeight, profile.heightCm),
    tdee: { value: tdee, bmr, bmrFormula },
    bodyFatAssumption: latestPhysique
      ? {
          minPercent: latestPhysique.estimatedBodyFatRange.minPercent,
          maxPercent: latestPhysique.estimatedBodyFatRange.maxPercent,
          midpointPercent: midpointBodyFatPercent(latestPhysique.estimatedBodyFatRange),
          assessedAt: latestPhysique.assessedAt,
          physiqueCategory: latestPhysique.physiqueCategory,
          confidence: latestPhysique.confidence,
        }
      : null,
    milestones,
    goalProjection,
    workoutStreak,
    weightStreak,
    weightTrends,
    coachingTip,
  };
}
