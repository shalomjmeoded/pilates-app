import type {
  AiExerciseSubstitution,
  AiMealEstimate,
  AiPhysiqueAssessment,
  AiWorkoutChangeSuggestion,
  AiWeeklyCoachInsight,
  PhysiqueAssessmentRequest,
} from '@/types/ai';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';
import type { WeeklyCoachSummary } from '@/types/coaching';
import type { WorkoutChangeRequest, WorkoutFocusArea } from '@/types/workout';

export interface AiProvider {
  estimateMealFromText(description: string): Promise<AiMealEstimate>;
  estimateMealFromPhoto(imageBase64: string): Promise<AiMealEstimate>;
  generateWeeklyCoach(summary: WeeklyCoachSummary): Promise<AiWeeklyCoachInsight>;
  substituteExercise(context: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    libraryExerciseIds: string[];
    swapReason: ExerciseSwapReason;
  }): Promise<AiExerciseSubstitution>;
  suggestWorkoutChange(context: WorkoutChangeRequest & {
    availableMinuteOptions: number[];
    availableFocusAreas: WorkoutFocusArea[];
    todayMovementCount: number;
    todayEstimatedMinutes: number;
    decisionMode?: 'standard' | 'onboarding_seed';
    onboardingProfile?: {
      fitnessGoal: string;
      trainingFrequency: string;
      exercisePreferences: string[];
      paceKgPerWeek: number;
      weightTrajectory: string;
    };
  }): Promise<AiWorkoutChangeSuggestion>;
  assessPhysique(context: PhysiqueAssessmentRequest): Promise<AiPhysiqueAssessment>;
}
