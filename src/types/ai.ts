import type { FitnessGoal, GenderIdentity } from './profile';
import type {
  BodyFatRange,
  PhysiqueCategory,
  PhysiqueConfidence,
} from './physiqueAssessment';

export interface AiMealEstimate {
  mealTitle: string;
  confidence: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  ingredients: Array<{ name: string; grams: number }>;
}

export interface AiWorkoutAdaptation {
  exerciseIds: string[];
  coachingCopy?: string;
}

export interface AiCoachingTip {
  tip: string;
  relatedGoal?: FitnessGoal;
}

export interface AiWeeklyCoachInsight {
  summary: string;
  wins: string[];
  focusForNextWeek: string;
  nutritionTip: string;
  workoutTip: string;
}

export interface AiExerciseSubstitution {
  replacementExerciseId: string;
  reason: string;
  coachingNote: string;
}

export interface AiPhysiqueAssessment {
  physiqueCategory: PhysiqueCategory;
  estimatedBodyFatRange: BodyFatRange;
  confidence: PhysiqueConfidence;
  nutritionAdjustmentSuggestion: string;
  workoutFocusSuggestion: string;
}

export interface PhysiqueAssessmentRequest {
  frontImageBase64: string;
  sideImageBase64?: string;
  backImageBase64?: string;
  notes?: string;
  genderIdentity?: GenderIdentity;
  ageYears?: number;
}
