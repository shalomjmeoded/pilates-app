import type { WorkoutPlanExerciseDetail } from '@/types/workout';

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function deriveWorkoutFocusTitle(exercises: WorkoutPlanExerciseDetail[]): string {
  const groups = [...new Set(exercises.map((item) => item.exercise.muscleGroup))];
  if (groups.length === 0) {
    return 'Full Body Flow';
  }
  if (groups.length >= 3) {
    return groups
      .slice(0, 3)
      .map((group) => titleCase(group))
      .join(' · ');
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

export function estimateWorkoutMinutes(input: number | WorkoutPlanExerciseDetail[]): number {
  if (typeof input === 'number') {
    return Math.max(12, Math.round(input * 2.2));
  }

  if (input.length === 0) {
    return 0;
  }

  const totalSeconds = input.reduce((sum, item) => {
    const activeSecondsPerSet = item.holdSeconds
      ? item.holdSeconds
      : Math.max(1, item.reps ?? 8) * 4;
    const betweenSetRest = Math.max(0, item.sets - 1) * 18;
    return sum + activeSecondsPerSet * item.sets + betweenSetRest + 15;
  }, 0);

  return Math.max(8, Math.round(totalSeconds / 60));
}
