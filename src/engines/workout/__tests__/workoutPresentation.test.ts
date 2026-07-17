import type { WorkoutPlanExerciseDetail } from '@/types/workout';

import { estimateWorkoutMinutes } from '../workoutPresentation';

function movement(overrides: Partial<WorkoutPlanExerciseDetail>): WorkoutPlanExerciseDetail {
  return {
    exerciseId: 'movement',
    sortOrder: 1,
    sets: 3,
    reps: 10,
    holdSeconds: null,
    exercise: {} as WorkoutPlanExerciseDetail['exercise'],
    ...overrides,
  };
}

describe('estimateWorkoutMinutes', () => {
  it('uses sets and prescriptions instead of exercise count alone', () => {
    const short = Array.from({ length: 6 }, (_, index) =>
      movement({ exerciseId: `short-${index}`, sortOrder: index + 1, sets: 2, reps: 6 }),
    );
    const long = Array.from({ length: 6 }, (_, index) =>
      movement({ exerciseId: `long-${index}`, sortOrder: index + 1, sets: 4, reps: 15 }),
    );

    expect(estimateWorkoutMinutes(long)).toBeGreaterThan(estimateWorkoutMinutes(short));
  });

  it('accounts for timed holds', () => {
    const repetitions = Array.from({ length: 6 }, (_, index) =>
      movement({ exerciseId: `reps-${index}`, sortOrder: index + 1, sets: 3, reps: 6 }),
    );
    const holds = Array.from({ length: 6 }, (_, index) =>
      movement({ exerciseId: `holds-${index}`, sortOrder: index + 1, sets: 3, reps: null, holdSeconds: 60 }),
    );

    expect(estimateWorkoutMinutes(holds)).toBeGreaterThan(estimateWorkoutMinutes(repetitions));
  });

  it('keeps a standard nine-movement session close to fifteen minutes', () => {
    const standard = Array.from({ length: 9 }, (_, index) =>
      movement({ exerciseId: `standard-${index}`, sortOrder: index + 1, sets: 3, reps: 12 }),
    );

    expect(estimateWorkoutMinutes(standard)).toBe(14);
  });

  it('returns zero for an empty session', () => {
    expect(estimateWorkoutMinutes([])).toBe(0);
  });
});
