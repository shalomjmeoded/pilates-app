import { useCallback, useState } from 'react';

import {
  completeWorkoutSession,
  getSessionExercisesPendingFeedback,
  saveSessionFeedback,
} from '@/db/repositories/workoutRepository';
import { ensureNextDayPlanAdapted } from '@/engines/workout';
import { isFeedbackComplete } from '@/engines/workout/feedback';
import type { ExerciseFeedback } from '@/types/exercise';
import type { WorkoutSessionExerciseFeedback } from '@/types/workout';

export { isFeedbackComplete } from '@/engines/workout/feedback';

export function useCompleteWorkoutSession(sessionId: string, planDate: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (feedbackMap: Record<string, ExerciseFeedback | undefined>) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const required = await getSessionExercisesPendingFeedback(sessionId);
        if (!isFeedbackComplete(required, feedbackMap)) {
          setError('Please add feedback for every exercise before finishing.');
          return false;
        }

        const payload: WorkoutSessionExerciseFeedback[] = required.map((item) => ({
          exerciseId: item.exerciseId,
          sortOrder: item.sortOrder,
          feedback: feedbackMap[`${item.exerciseId}:${item.sortOrder}`]!,
          completedAt: new Date().toISOString(),
        }));

        await saveSessionFeedback(sessionId, payload);
        await completeWorkoutSession(sessionId);
        await ensureNextDayPlanAdapted(planDate);
        return true;
      } catch (submitError) {
        setError(
          submitError instanceof Error ? submitError.message : 'Could not save workout feedback.',
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [planDate, sessionId],
  );

  return { submit, isSubmitting, error };
}
