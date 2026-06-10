import type { Exercise } from '@/types/exercise';

export function findSwapCandidate(
  current: Exercise,
  library: Exercise[],
  excludedExerciseIds: Set<string>,
): Exercise | null {
  const candidates = library.filter((exercise) => {
    if (exercise.id === current.id || excludedExerciseIds.has(exercise.id)) {
      return false;
    }
    return (
      exercise.muscleGroup === current.muscleGroup &&
      exercise.difficulty === current.difficulty &&
      exercise.equipment === current.equipment
    );
  });

  if (candidates.length > 0) {
    return candidates[0];
  }

  const relaxed = library.filter((exercise) => {
    if (exercise.id === current.id || excludedExerciseIds.has(exercise.id)) {
      return false;
    }
    return exercise.muscleGroup === current.muscleGroup && exercise.difficulty === current.difficulty;
  });

  return relaxed[0] ?? null;
}
