import type { FitnessGoal } from './profile';

export interface WeeklyCoachSummary {
  weekStart: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  calorieAdherencePercent: number | null;
  proteinAdherencePercent: number | null;
  weightTrend: 'down' | 'up' | 'stable' | 'unknown';
  skippedExerciseCount: number;
  topSkippedExerciseNames: string[];
  goal: FitnessGoal;
  /** Days in the review week with a weight log. */
  weightLogDays?: number;
  /** Days in the review week with calorie intake logged. */
  nutritionLogDays?: number;
  averageCalories?: number | null;
  averageProteinG?: number | null;
}

export interface WeeklyCoachInsightContent {
  summary: string;
  wins: string[];
  focusForNextWeek: string;
  /** Genuine feedback on food choices and calorie/protein patterns. */
  nutritionTip: string;
  /** Genuine feedback on weight trend and logging rhythm. */
  weightTip: string;
  /** Genuine feedback on how sessions/exercises went. */
  workoutTip: string;
  source: 'ai' | 'local';
  generatedAt: string;
  /** Present when the coach changed nutrition targets this week. */
  targetAdjustmentSummary?: string;
}

export type WeeklyTargetAdjustmentReason = 'too_fast' | 'too_slow';

export interface WeeklyTargetAdjustmentRecord {
  weekStart: string;
  reason: WeeklyTargetAdjustmentReason;
  observedPaceKgPerWeek: number;
  expectedPaceKgPerWeek: number;
  calorieDelta: number;
  previous: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  next: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
  appliedAt: string;
  message: string;
}

export interface CoachingInsight {
  id?: string;
  insightDate: string;
  dailyTip: string;
  weeklyInsight?: string;
  payload: CoachingPayload;
}

export interface CoachingPayload {
  proteinAdherencePercent?: number;
  workoutsThisWeek?: number;
  daysSinceLastWeightLog?: number;
  calorieAdherencePercent?: number;
  weeklyCoach?: WeeklyCoachInsightContent;
  weeklyCoachInput?: WeeklyCoachSummary;
  weeklyTargetAdjustment?: WeeklyTargetAdjustmentRecord;
}
