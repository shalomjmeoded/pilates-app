import type { Exercise, ExerciseFeedback } from './exercise';

export interface WorkoutPlanExercise {
  exerciseId: string;
  sortOrder: number;
  sets: number;
  reps: number | null;
  holdSeconds: number | null;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  planDate: string;
  exercises: WorkoutPlanExercise[];
  source: 'deterministic' | 'ai_adjusted';
  generatedAt: string;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  startedAt: string;
  endedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentExerciseIndex?: number;
  elapsedSeconds?: number;
}

export interface WorkoutStreakStats {
  currentStreak: number;
  longestStreak: number;
  monthlyCompletionPercent: number;
}

export interface WorkoutSessionExerciseFeedback {
  exerciseId: string;
  sortOrder: number;
  feedback: ExerciseFeedback;
  completedAt?: string;
}

export interface WorkoutPlanExerciseDetail extends WorkoutPlanExercise {
  exercise: Exercise;
}

export interface WorkoutDayView {
  planDate: string;
  plan: WorkoutPlan | null;
  exercises: WorkoutPlanExerciseDetail[];
  session: WorkoutSession | null;
  sessionFeedback: WorkoutSessionExerciseFeedback[];
  isReadOnly: boolean;
  isToday: boolean;
  isFuture: boolean;
  planRefreshed?: boolean;
  partialLibraryMatch?: boolean;
}

export type PlanGenerationErrorCode =
  | 'NO_PROFILE'
  | 'EMPTY_LIBRARY'
  | 'INSUFFICIENT_EXERCISES'
  | 'INVALID_LIBRARY_IDS'
  | 'UNKNOWN';

export class PlanGenerationError extends Error {
  readonly code: PlanGenerationErrorCode;

  constructor(code: PlanGenerationErrorCode, message: string) {
    super(message);
    this.name = 'PlanGenerationError';
    this.code = code;
  }
}
