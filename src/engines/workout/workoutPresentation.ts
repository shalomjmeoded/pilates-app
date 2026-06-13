import type { WorkoutPlanExerciseDetail } from '@/types/workout';

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function deriveWorkoutFocusTitle(exercises: WorkoutPlanExerciseDetail[]): string {
  const groups = [...new Set(exercises.slice(0, 6).map((item) => item.exercise.muscleGroup))];
  if (groups.length === 0) {
    return 'Full Body Flow';
  }
  return groups
    .slice(0, 2)
    .map((group) => titleCase(group))
    .join(' + ');
}

export function deriveWhyThisWorkout(exercises: WorkoutPlanExerciseDetail[]): string {
  if (exercises.length === 0) {
    return 'A balanced Pilates session designed to support your weekly rhythm.';
  }

  const groups = [...new Set(exercises.map((item) => titleCase(item.exercise.muscleGroup)))];
  const focusList =
    groups.length <= 2
      ? groups.join(' and ')
      : `${groups.slice(0, 2).join(', ')} and more`;

  const hasCore = groups.some((group) => group.toLowerCase().includes('core'));
  const intention = hasCore
    ? 'build deep stability while staying gentle on your joints'
    : 'lengthen, strengthen, and restore energy without overwhelm';

  return `Today's session emphasizes ${focusList} — chosen to help you ${intention}.`;
}

export function estimateWorkoutMinutes(exerciseCount: number): number {
  return Math.max(12, Math.round(exerciseCount * 2.2));
}
