import type { NutritionTargets } from './nutrition';
import type { GenderIdentity } from './profile';

export type BmrFormula = 'female' | 'male' | 'neutral' | 'katch_mcardle';

export interface BmrResult {
  bmr: number;
  formula: BmrFormula;
}

export interface TdeeResult {
  tdee: number;
  multiplier: number;
}

export type MacroPlan = NutritionTargets;

export interface SafetyWarning {
  triggered: boolean;
  message: string;
  threshold: number;
}

export interface RoadmapPoint {
  week: number;
  projectedWeightKg: number;
}

export interface BaselinePlanResult {
  bmr: number;
  tdee: number;
  goalCalories: number;
  macros: MacroPlan;
  bmi: number;
  safetyWarning: SafetyWarning;
  roadmap: RoadmapPoint[];
}

export interface CalculationInput {
  genderIdentity: GenderIdentity;
  birthYear: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  trainingFrequency: import('./profile').TrainingFrequency;
  fitnessGoal: import('./profile').FitnessGoal;
  weightTrajectory: import('./profile').WeightTrajectory;
  paceKgPerWeek: import('./profile').Pace;
  /** Midpoint from latest saved visual physique assessment, when available. */
  bodyFatPercent?: number;
}
