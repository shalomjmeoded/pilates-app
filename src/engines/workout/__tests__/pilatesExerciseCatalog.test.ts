import seedData from '../../../../assets/seed/exercises.json';

import { generateWorkoutPlan } from '../planGenerator';
import {
  isHardExcludedExercise,
  isPilatesAlignedExercise,
  normalizePilatesExercise,
  selectPilatesCandidatePool,
} from '../pilatesExerciseCatalog';
import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';

const library = (seedData as Exercise[]).map(normalizePilatesExercise);

const profile: Profile = {
  genderIdentity: 'female',
  birthYear: 1992,
  heightCm: 168,
  currentWeightKg: 65,
  goalWeightKg: 60,
  trainingFrequency: '3_4',
  fitnessGoal: 'get_toned',
  exercisePreferences: ['mat_pilates', 'core_focus'],
  mediaPreference: 'video_streaming',
  nutritionMode: 'full_tracking',
  weightTrajectory: 'weight_loss',
  paceKgPerWeek: 0.5,
};

describe('pilatesExerciseCatalog', () => {
  it('excludes generic gym movements from Pilates workouts', () => {
    const squat = library.find((exercise) => exercise.name.includes('Squat'));
    expect(squat).toBeTruthy();
    expect(isHardExcludedExercise(squat!)).toBe(true);
    expect(isPilatesAlignedExercise(squat!)).toBe(false);
  });

  it('keeps classical mat movements in the Pilates pool', () => {
    const deadBug = library.find((exercise) => exercise.name === 'Dead Bug');
    const plank = library.find((exercise) => exercise.name === 'Plank');
    expect(deadBug && isPilatesAlignedExercise(deadBug)).toBe(true);
    expect(plank && isPilatesAlignedExercise(plank)).toBe(true);
  });

  it('builds a Pilates-focused candidate pool from the seed library', () => {
    const pool = selectPilatesCandidatePool(library);
    expect(pool.length).toBeGreaterThanOrEqual(15);
    expect(pool.some((exercise) => /squat/i.test(exercise.name))).toBe(false);
  });
});

describe('generateWorkoutPlan pilates focus', () => {
  it('generates a plan dominated by Pilates-aligned exercises', () => {
    const plan = generateWorkoutPlan(profile, library, '2026-06-09', 'plan-1');
    const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
    const selected = plan.exercises.map((item) => byId.get(item.exerciseId)!);
    const pilatesCount = selected.filter(isPilatesAlignedExercise).length;

    expect(plan.exercises.length).toBeGreaterThanOrEqual(9);
    expect(pilatesCount).toBeGreaterThanOrEqual(8);
    expect(selected.some((exercise) => /squat|walking lunge|frog hop/i.test(exercise.name))).toBe(
      false,
    );
  });
});
