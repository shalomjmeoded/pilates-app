import type { Exercise, ExerciseMuscleGroup } from '@/types/exercise';
import type { Profile } from '@/types/profile';

import { generateWorkoutPlan } from '../planGenerator';

const baseProfile: Profile = {
  genderIdentity: 'female',
  birthYear: 1992,
  heightCm: 168,
  currentWeightKg: 66,
  goalWeightKg: 62,
  trainingFrequency: '3_4',
  fitnessGoal: 'get_toned',
  exercisePreferences: ['core_focus', 'mat_pilates', 'flexibility_length'],
  mediaPreference: 'static_only',
  nutritionMode: 'full_tracking',
  weightTrajectory: 'weight_loss',
  paceKgPerWeek: 0.5,
};

function makeExercise(
  id: string,
  muscleGroup: ExerciseMuscleGroup,
  difficulty: Exercise['difficulty'],
  sessionRole: Exercise['sessionRole'],
): Exercise {
  return {
    id,
    name: id,
    description: 'desc',
    instructions: ['step'],
    commonMistakes: ['mistake'],
    difficulty,
    muscleGroup,
    secondaryMuscles: [],
    equipment: 'mat',
    repsBaseline: 10,
    holdSeconds: null,
    caloriesFactor: 0.08,
    thumbnailUri: `assets/exercises/thumbnails/${id}.jpg`,
    gifUri: `assets/exercises/gifs/${id}.jpg`,
    tags: ['mat_pilates', 'core_focus'],
    categories: ['pilates', 'core'],
    sessionRole,
    source: 'free_exercise_db',
  };
}

const exercises: Exercise[] = [
  makeExercise('core_1', 'core', 'beginner', 'warmup'),
  makeExercise('core_2', 'core', 'intermediate', 'main'),
  makeExercise('core_3', 'core', 'advanced', 'main'),
  makeExercise('glute_1', 'glutes', 'beginner', 'main'),
  makeExercise('glute_2', 'glutes', 'intermediate', 'main'),
  makeExercise('posture_1', 'upper back', 'beginner', 'main'),
  makeExercise('mobility_1', 'lower back', 'beginner', 'cooldown'),
  makeExercise('full_1', 'full body', 'intermediate', 'main'),
  makeExercise('ham_1', 'hamstrings', 'intermediate', 'main'),
  makeExercise('quad_1', 'quadriceps', 'beginner', 'main'),
  makeExercise('shoulder_1', 'shoulders', 'intermediate', 'main'),
  makeExercise('arm_1', 'arms', 'advanced', 'main'),
];

describe('generateWorkoutPlan overrides', () => {
  it('uses target minutes to control generated workout length', () => {
    const shortPlan = generateWorkoutPlan(
      baseProfile,
      exercises,
      '2026-06-13',
      'plan-short',
      undefined,
      undefined,
      { targetMinutes: 15, focusArea: 'core', intensity: 'balanced' },
    );

    const longPlan = generateWorkoutPlan(
      baseProfile,
      exercises,
      '2026-06-13',
      'plan-long',
      undefined,
      undefined,
      { targetMinutes: 35, focusArea: 'core', intensity: 'balanced' },
    );

    expect(shortPlan.exercises.length).toBe(9);
    expect(longPlan.exercises.length).toBeGreaterThan(shortPlan.exercises.length);
  });

  it('uses intensity override to adjust set volume', () => {
    const lighter = generateWorkoutPlan(
      baseProfile,
      exercises,
      '2026-06-13',
      'plan-lighter',
      undefined,
      undefined,
      { targetMinutes: 25, focusArea: 'glutes', intensity: 'lighter' },
    );

    const challenging = generateWorkoutPlan(
      baseProfile,
      exercises,
      '2026-06-13',
      'plan-challenging',
      undefined,
      undefined,
      { targetMinutes: 25, focusArea: 'glutes', intensity: 'challenging' },
    );

    const avgLighter =
      lighter.exercises.reduce((sum, item) => sum + item.sets, 0) / lighter.exercises.length;
    const avgChallenging =
      challenging.exercises.reduce((sum, item) => sum + item.sets, 0) / challenging.exercises.length;

    expect(avgChallenging).toBeGreaterThan(avgLighter);
  });

  it('reduces repeated exercises when recent alternatives are available', () => {
    const baseline = generateWorkoutPlan(
      baseProfile,
      exercises,
      '2026-06-13',
      'plan-baseline',
      undefined,
      undefined,
      { targetMinutes: 15, focusArea: 'full_body', intensity: 'balanced' },
    );
    const repeatedIds = baseline.exercises.slice(0, 3).map((item) => item.exerciseId);
    const adapted = generateWorkoutPlan(
      baseProfile,
      exercises,
      '2026-06-13',
      'plan-varied',
      {
        skippedFrequentIds: new Set(),
        lastSessionFeedback: [],
        libraryById: new Map(exercises.map((exercise) => [exercise.id, exercise])),
        recentExerciseCounts: Object.fromEntries(repeatedIds.map((id) => [id, 5])),
      },
      undefined,
      { targetMinutes: 15, focusArea: 'full_body', intensity: 'balanced' },
    );

    const repeatedInAdaptedPlan = adapted.exercises.filter((item) =>
      repeatedIds.includes(item.exerciseId),
    );
    expect(repeatedInAdaptedPlan.length).toBeLessThan(repeatedIds.length);
  });

  it('uses the last session difficulty to make a bounded set adjustment', () => {
    const context = {
      skippedFrequentIds: new Set<string>(),
      lastSessionFeedback: [],
      libraryById: new Map(exercises.map((exercise) => [exercise.id, exercise])),
    };
    const easier = generateWorkoutPlan(baseProfile, exercises, '2026-06-13', 'easy', {
      ...context,
      lastSessionDifficulty: 'too_hard',
    });
    const harder = generateWorkoutPlan(baseProfile, exercises, '2026-06-13', 'hard', {
      ...context,
      lastSessionDifficulty: 'too_easy',
    });

    expect(harder.exercises.reduce((sum, item) => sum + item.sets, 0)).toBeGreaterThan(
      easier.exercises.reduce((sum, item) => sum + item.sets, 0),
    );
    expect(Math.min(...easier.exercises.map((item) => item.sets))).toBeGreaterThanOrEqual(2);
    expect(Math.max(...harder.exercises.map((item) => item.sets))).toBeLessThanOrEqual(5);
  });
});
