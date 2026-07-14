/**
 * Hard floors for exercises per session length.
 * In-between durations use the nearest lower bucket (e.g. 20 → 15, 30 → 25).
 */
export const SESSION_DURATION_BUCKETS = [
  { minutes: 15, minExercises: 5, maxExercises: 8 },
  { minutes: 25, minExercises: 8, maxExercises: 10 },
  { minutes: 35, minExercises: 10, maxExercises: 12 },
] as const;

export type SessionDurationBucket = (typeof SESSION_DURATION_BUCKETS)[number];

export interface ExerciseCountBounds {
  minExercises: number;
  maxExercises: number;
  bucketMinutes: number;
}

/** Resolve min/max exercise counts for a target session length in minutes. */
export function exerciseCountBoundsForMinutes(targetMinutes: number): ExerciseCountBounds {
  let bucket: SessionDurationBucket = SESSION_DURATION_BUCKETS[0];
  for (const option of SESSION_DURATION_BUCKETS) {
    if (option.minutes <= targetMinutes) {
      bucket = option;
    }
  }

  return {
    minExercises: bucket.minExercises,
    maxExercises: bucket.maxExercises,
    bucketMinutes: bucket.minutes,
  };
}

/** Default session minutes from training frequency when no override is set. */
export function defaultTargetMinutesForProfile(trainingFrequency: string): number {
  if (trainingFrequency === 'none') {
    return 15;
  }
  if (trainingFrequency === '1_2') {
    return 25;
  }
  return 35;
}

export function planMeetsExerciseFloor(
  exerciseCount: number,
  targetMinutes: number,
): boolean {
  return exerciseCount >= exerciseCountBoundsForMinutes(targetMinutes).minExercises;
}
