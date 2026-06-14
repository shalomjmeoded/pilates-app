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

const weekDates = [
  '2026-06-07',
  '2026-06-08',
  '2026-06-09',
  '2026-06-10',
  '2026-06-11',
  '2026-06-12',
  '2026-06-13',
];

function planSignature(plan: ReturnType<typeof generateWorkoutPlan>): string {
  return plan.exercises.map((exercise) => exercise.exerciseId).join(',');
}

function buildWeeklyPlans(inputProfile: Profile) {
  return weekDates.map((date) => generateWorkoutPlan(inputProfile, library, date, date));
}

describe('pilatesExerciseCatalog', () => {
  it('excludes generic gym movements from Pilates workouts', () => {
    const squat = library.find((exercise) => exercise.name.includes('Squat'));
    expect(squat).toBeTruthy();
    expect(isHardExcludedExercise(squat!)).toBe(true);
    expect(isPilatesAlignedExercise(squat!)).toBe(false);
  });

  it('removes equipment-heavy gym-photo movements from the curated library', () => {
    const removedNames = [
      'Physioball Hip Bridge',
      'Suspended Reverse Crunch',
      'Hammer Curls',
      'Kettlebell Windmill',
    ];

    for (const name of removedNames) {
      expect(library.find((exercise) => exercise.name === name)).toBeUndefined();
    }
  });

  it('keeps classical mat movements in the Pilates pool', () => {
    const deadBug = library.find((exercise) => exercise.name === 'Dead Bug');
    const plank = library.find((exercise) => exercise.name === 'Plank');
    expect(deadBug && isPilatesAlignedExercise(deadBug)).toBe(true);
    expect(plank && isPilatesAlignedExercise(plank)).toBe(true);
  });

  it('builds a Pilates-focused candidate pool from the seed library', () => {
    const pool = selectPilatesCandidatePool(library);
    expect(pool.length).toBeGreaterThanOrEqual(30);
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

  it('generates a balanced Pilates workout flow', () => {
    const plan = generateWorkoutPlan(profile, library, '2026-06-09', 'plan-1');
    const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
    const selected = plan.exercises.map((item) => byId.get(item.exerciseId)!);
    const muscleGroups = new Set(selected.map((exercise) => exercise.muscleGroup));

    expect(muscleGroups.size).toBeGreaterThanOrEqual(4);
    expect(
      selected.every(
        (exercise) => !/physioball|exercise ball|bench|decline|suspended|hanging/i.test(exercise.name),
      ),
    ).toBe(true);

    const firstMainIndex = selected.findIndex((exercise) => exercise.sessionRole === 'main');
    const warmupAfterMain = selected
      .slice(Math.max(firstMainIndex, 0))
      .some((exercise) => exercise.sessionRole === 'warmup');
    expect(warmupAfterMain).toBe(false);
  });

  it('keeps plans stable per date while varying adjacent dates', () => {
    const first = generateWorkoutPlan(profile, library, '2026-06-09', 'plan-1');
    const repeated = generateWorkoutPlan(profile, library, '2026-06-09', 'plan-2');
    const nextDay = generateWorkoutPlan(profile, library, '2026-06-10', 'plan-3');

    expect(planSignature(repeated)).toBe(planSignature(first));
    expect(planSignature(nextDay)).not.toBe(planSignature(first));
  });

  it('rotates coherent workouts across a week', () => {
    const weeklyPlans = buildWeeklyPlans(profile);
    const uniquePlans = new Set(weeklyPlans.map(planSignature));
    const byId = new Map(library.map((exercise) => [exercise.id, exercise]));

    expect(uniquePlans.size).toBeGreaterThanOrEqual(4);
    for (const plan of weeklyPlans) {
      const selected = plan.exercises.map((item) => byId.get(item.exerciseId)!);
      expect(selected.filter(isPilatesAlignedExercise).length).toBeGreaterThanOrEqual(8);
      expect(new Set(selected.map((exercise) => exercise.muscleGroup)).size).toBeGreaterThanOrEqual(
        4,
      );
    }
  });

  it('prescribes more work for build-muscle weeks than maintenance weeks', () => {
    const maintenanceProfile: Profile = {
      ...profile,
      fitnessGoal: 'maintain',
      weightTrajectory: 'steady_state',
      paceKgPerWeek: 0.25,
    };
    const buildMuscleProfile: Profile = {
      ...profile,
      fitnessGoal: 'build_muscle',
      weightTrajectory: 'lean_mass',
      paceKgPerWeek: 0.25,
    };
    const countFourSetExercises = (plans: ReturnType<typeof buildWeeklyPlans>) =>
      plans.flatMap((plan) => plan.exercises).filter((exercise) => exercise.sets === 4).length;

    expect(countFourSetExercises(buildWeeklyPlans(buildMuscleProfile))).toBeGreaterThan(
      countFourSetExercises(buildWeeklyPlans(maintenanceProfile)),
    );
  });
});
