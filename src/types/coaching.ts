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
}

export interface WeeklyCoachInsightContent {
  summary: string;
  wins: string[];
  focusForNextWeek: string;
  nutritionTip: string;
  workoutTip: string;
  source: 'ai' | 'local';
  generatedAt: string;
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
}
