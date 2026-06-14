import { useCallback, useState } from 'react';

import { getAllExercises } from '@/db/repositories/exerciseRepository';
import { getPremiumStatus } from '@/db/repositories/premiumRepository';
import { hasPremiumAccess } from '@/engines/monetization/premiumAccess';
import { getWorkoutPlanByDate, swapPlanExercise } from '@/db/repositories/workoutRepository';
import { resolveExerciseSubstitution } from '@/engines/workout/exerciseSubstitution';
import { aiFacade } from '@/services/ai';
import type { Exercise } from '@/types/exercise';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';
import type { WorkoutPlanExercise } from '@/types/workout';

export interface ExerciseSubstitutionResult {
  exercise: Exercise;
  exerciseName: string;
  reason: string;
  coachingNote: string;
  source: 'ai' | 'fallback';
}

export function useExerciseSubstitution(planDate: string) {
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const substitute = useCallback(
    async (input: {
      exercise: Exercise;
      planId: string;
      planExercise: WorkoutPlanExercise;
      reason: ExerciseSwapReason;
    }): Promise<ExerciseSubstitutionResult | null> => {
      setIsSwapping(true);
      setError(null);

      try {
        const [premium, library, plan] = await Promise.all([
          getPremiumStatus(),
          getAllExercises(),
          getWorkoutPlanByDate(planDate),
        ]);

        const excluded = new Set(plan?.exercises.map((item) => item.exerciseId) ?? []);
        const candidates = library
          .filter((item) => !excluded.has(item.id) && item.id !== input.exercise.id)
          .map((item) => item.id);

        if (!hasPremiumAccess(premium)) {
          setError('Exercise substitutions require BetterMe Premium.');
          return null;
        }

        let aiSuggestion = null;
        if (premium.isPremium) {
          try {
            aiSuggestion = await aiFacade.substituteExercise({
              exerciseId: input.exercise.id,
              exerciseName: input.exercise.name,
              muscleGroup: input.exercise.muscleGroup,
              libraryExerciseIds: candidates,
              swapReason: input.reason,
            });
          } catch {
            aiSuggestion = null;
          }
        }

        const resolved = resolveExerciseSubstitution(
          input.exercise,
          library,
          excluded,
          input.reason,
          aiSuggestion,
        );

        if (!resolved) {
          setError('No valid replacement found in your exercise library.');
          return null;
        }

        await swapPlanExercise(
          input.planId,
          input.planExercise.sortOrder,
          resolved.exercise.id,
        );

        return {
          exercise: resolved.exercise,
          exerciseName: resolved.exercise.name,
          reason: resolved.reason,
          coachingNote: resolved.coachingNote,
          source: resolved.source,
        };
      } catch (substitutionError) {
        setError(
          substitutionError instanceof Error
            ? substitutionError.message
            : 'Could not swap exercise.',
        );
        return null;
      } finally {
        setIsSwapping(false);
      }
    },
    [planDate],
  );

  return { substitute, isSwapping, error, clearError: () => setError(null) };
}
