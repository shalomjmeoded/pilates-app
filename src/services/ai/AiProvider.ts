import type {
  AiExerciseSubstitution,
  AiMealEstimate,
  AiPhysiqueAssessment,
  AiWeeklyCoachInsight,
  PhysiqueAssessmentRequest,
} from '@/types/ai';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';
import type { WeeklyCoachSummary } from '@/types/coaching';

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
  assessPhysique(context: PhysiqueAssessmentRequest): Promise<AiPhysiqueAssessment>;
}
