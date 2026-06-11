import type { PhysiqueCategory, PhysiqueConfidence } from '@/types/physiqueAssessment';
import type { WorkoutStreakStats } from '@/types/workout';

export type WeightChartRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface WeightLog {
  id: string;
  loggedAt: string;
  weightKg: number;
  note?: string;
}

export interface WeightLogInput {
  weightKg: number;
  note?: string;
  loggedAt?: string;
}

export interface WeightJourney {
  startWeightKg: number;
  currentWeightKg: number;
  goalWeightKg: number;
  differenceKg: number;
  differenceLabel: string;
  progressPercent: number;
  direction: 'loss' | 'gain' | 'maintain';
}

export interface GoalProjection {
  hasEnoughData: boolean;
  estimatedDate?: string;
  message: string;
}

export interface AdherenceMetric {
  label: string;
  adherencePercent: number;
  daysIncluded: number;
}

export interface ConsistencyBreakdown {
  score: number;
  workoutScore: number;
  calorieScore: number;
  proteinScore: number;
  weightLoggingScore: number;
}

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'above_typical';

export interface BmiInfo {
  value: number;
  category: BmiCategory;
  categoryLabel: string;
}

export interface TdeeInfo {
  value: number;
  bmr: number;
  bmrFormula?: import('@/types/calculations').BmrFormula;
}

export interface BodyFatAssumption {
  minPercent: number;
  maxPercent: number;
  midpointPercent: number;
  assessedAt: string;
  physiqueCategory: PhysiqueCategory;
  confidence: PhysiqueConfidence;
}

export type MilestoneKey =
  | 'first_weight_logged'
  | 'five_workouts_completed'
  | 'ten_meals_logged'
  | 'first_week_completed';

export interface MilestoneDefinition {
  key: MilestoneKey;
  title: string;
  description: string;
}

export interface MilestoneStatus extends MilestoneDefinition {
  unlocked: boolean;
  unlockedAt?: string;
}

export interface WeightStreakStats {
  currentStreak: number;
  longestStreak: number;
}

export interface WeightTrendAverages {
  weeklyAverageKg: number | null;
  monthlyAverageKg: number | null;
}

export interface ProgressDashboardData {
  journey: WeightJourney | null;
  goalWeightKg: number;
  weightLogs: WeightLog[];
  adherence: {
    calories: AdherenceMetric;
    protein: AdherenceMetric;
    fiber: AdherenceMetric;
  };
  consistency: ConsistencyBreakdown;
  bmi: BmiInfo | null;
  tdee: TdeeInfo | null;
  bodyFatAssumption: BodyFatAssumption | null;
  milestones: MilestoneStatus[];
  goalProjection: GoalProjection;
  workoutStreak: WorkoutStreakStats;
  weightStreak: WeightStreakStats;
  weightTrends: WeightTrendAverages;
  coachingTip: string;
}

export interface ChartPoint {
  date: string;
  weightKg: number;
  x: number;
  y: number;
}

export interface BodyMeasurement {
  id: string;
  measuredAt: string;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  capturedAt: string;
  uri: string;
  note?: string;
}
