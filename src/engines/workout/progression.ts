import type { Exercise, ExerciseFeedback } from '@/types/exercise';
import type { WorkoutPlanExercise, WorkoutSessionExerciseFeedback } from '@/types/workout';

const SKIPPED_DEPRIORITIZE_THRESHOLD = 2;
const MODIFIED_REP_REDUCTION = 0.9;

export interface AdaptationContext {
  skippedFrequentIds: Set<string>;
  lastSessionFeedback: WorkoutSessionExerciseFeedback[];
  libraryById: Map<string, Exercise>;
}

export function getDeprioritizedExerciseIds(
  skipCounts: Record<string, number>,
): Set<string> {
  const ids = new Set<string>();
  for (const [exerciseId, count] of Object.entries(skipCounts)) {
    if (count >= SKIPPED_DEPRIORITIZE_THRESHOLD) {
      ids.add(exerciseId);
    }
  }
  return ids;
}

export function applyFeedbackProgression(
  planExercises: WorkoutPlanExercise[],
  feedback: WorkoutSessionExerciseFeedback[],
): WorkoutPlanExercise[] {
  const feedbackByKey = new Map(
    feedback.map((item) => [`${item.exerciseId}:${item.sortOrder}`, item]),
  );

  return planExercises.map((planExercise) => {
    const key = `${planExercise.exerciseId}:${planExercise.sortOrder}`;
    const entry = feedbackByKey.get(key);
    if (!entry) {
      return planExercise;
    }

    switch (entry.feedback) {
      case 'completed': {
        if (planExercise.holdSeconds) {
          return { ...planExercise, holdSeconds: planExercise.holdSeconds + 5 };
        }
        if (planExercise.reps) {
          return { ...planExercise, reps: planExercise.reps + 1 };
        }
        return planExercise;
      }
      case 'modified': {
        if (planExercise.reps) {
          return {
            ...planExercise,
            reps: Math.max(1, Math.round(planExercise.reps * MODIFIED_REP_REDUCTION)),
          };
        }
        return planExercise;
      }
      case 'skipped':
        return planExercise;
    }
  });
}

export function shouldSwapExercise(
  exerciseId: string,
  context: AdaptationContext,
): boolean {
  return context.skippedFrequentIds.has(exerciseId);
}

export function findReplacementExercise(
  current: Exercise,
  library: Exercise[],
  usedIds: Set<string>,
  deprioritizedIds: Set<string>,
): Exercise | null {
  const sameMuscle = library.filter(
    (exercise) =>
      exercise.muscleGroup === current.muscleGroup &&
      exercise.id !== current.id &&
      !usedIds.has(exercise.id) &&
      !deprioritizedIds.has(exercise.id),
  );

  if (sameMuscle.length > 0) {
    return sameMuscle[0];
  }

  const fallback = library.find(
    (exercise) => !usedIds.has(exercise.id) && !deprioritizedIds.has(exercise.id),
  );
  return fallback ?? null;
}

export function swapSkippedExercises(
  planExercises: WorkoutPlanExercise[],
  feedback: WorkoutSessionExerciseFeedback[],
  context: AdaptationContext,
): WorkoutPlanExercise[] {
  const skippedKeys = new Set(
    feedback
      .filter((item) => item.feedback === 'skipped')
      .map((item) => `${item.exerciseId}:${item.sortOrder}`),
  );

  const usedIds = new Set<string>();
  const result: WorkoutPlanExercise[] = [];

  for (const planExercise of planExercises) {
    const key = `${planExercise.exerciseId}:${planExercise.sortOrder}`;
    let exerciseId = planExercise.exerciseId;

    if (skippedKeys.has(key) || context.skippedFrequentIds.has(exerciseId)) {
      const current = context.libraryById.get(exerciseId);
      if (current) {
        const replacement = findReplacementExercise(
          current,
          Array.from(context.libraryById.values()),
          usedIds,
          context.skippedFrequentIds,
        );
        if (replacement) {
          exerciseId = replacement.id;
        }
      }
    }

    usedIds.add(exerciseId);
    result.push({ ...planExercise, exerciseId });
  }

  return result;
}
