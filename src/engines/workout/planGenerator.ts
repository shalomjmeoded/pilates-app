import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';
import type { PhysiqueCategory } from '@/types/physiqueAssessment';
import type {
  WorkoutFocusArea,
  WorkoutGenerationOverrides,
  WorkoutIntensity,
  WorkoutPlan,
  WorkoutPlanExercise,
} from '@/types/workout';

import {
  isPilatesAlignedExercise,
  pilatesAffinityScore,
  selectPilatesCandidatePool,
} from './pilatesExerciseCatalog';
import type { AdaptationContext } from './progression';
import { swapSkippedExercises } from './progression';

export interface PhysiquePlanContext {
  physiqueCategory: PhysiqueCategory;
}

export type WorkoutFocus = 'core_control' | 'posterior_chain' | 'mobility_recovery' | 'full_body_control';

const TARGET_MIN = 9;
const TARGET_MAX = 12;
const MIN_PILATES_ALIGNED = 8;
const TARGET_DISTINCT_MUSCLE_GROUPS = 4;
const DATE_VARIETY_WEIGHT = 6;

interface PlanControls {
  focus: WorkoutFocus;
  targetMin: number;
  targetMax: number;
  intensity: WorkoutIntensity;
}

const GOAL_WEEKLY_FOCUS: Record<Profile['fitnessGoal'], WorkoutFocus[]> = {
  get_toned: [
    'full_body_control',
    'posterior_chain',
    'mobility_recovery',
    'core_control',
    'posterior_chain',
    'full_body_control',
    'mobility_recovery',
  ],
  maintain: [
    'full_body_control',
    'mobility_recovery',
    'core_control',
    'posterior_chain',
    'mobility_recovery',
    'full_body_control',
    'mobility_recovery',
  ],
  build_muscle: [
    'posterior_chain',
    'core_control',
    'full_body_control',
    'posterior_chain',
    'mobility_recovery',
    'posterior_chain',
    'core_control',
  ],
};

function stableHash(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function dateVarietyBonus(exercise: Exercise, planDate: string): number {
  return (stableHash(`${planDate}:${exercise.id}`) % 1000) / 1000 * DATE_VARIETY_WEIGHT;
}

function dayIndex(planDate: string): number {
  const parsed = new Date(`${planDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }
  return parsed.getUTCDay();
}

function weeklyFocusFor(profile: Profile, planDate: string): WorkoutFocus {
  const weeklyFocus = GOAL_WEEKLY_FOCUS[profile.fitnessGoal];
  return weeklyFocus[dayIndex(planDate)] ?? 'full_body_control';
}

function mapFocusAreaToWorkoutFocus(area: WorkoutFocusArea): WorkoutFocus {
  switch (area) {
    case 'core':
      return 'core_control';
    case 'glutes':
      return 'posterior_chain';
    case 'posture':
    case 'mobility':
      return 'mobility_recovery';
    case 'full_body':
    default:
      return 'full_body_control';
  }
}

function targetMaxForMinutes(targetMinutes: number): number {
  if (targetMinutes <= 18) {
    return 9;
  }
  if (targetMinutes <= 28) {
    return 10;
  }
  return TARGET_MAX;
}

function resolvePlanControls(
  profile: Profile,
  planDate: string,
  overrides?: WorkoutGenerationOverrides,
): PlanControls {
  const intensity = overrides?.intensity ?? 'balanced';
  const focus = overrides?.focusArea
    ? mapFocusAreaToWorkoutFocus(overrides.focusArea)
    : weeklyFocusFor(profile, planDate);
  const targetMax = overrides?.targetMinutes ? targetMaxForMinutes(overrides.targetMinutes) : TARGET_MAX;

  return {
    focus,
    targetMin: Math.min(TARGET_MIN, targetMax),
    targetMax,
    intensity,
  };
}

function focusExerciseBonus(exercise: Exercise, focus: WorkoutFocus): number {
  switch (focus) {
    case 'core_control':
      if (exercise.muscleGroup === 'core') {
        return 5;
      }
      if (exercise.muscleGroup === 'lower back' || exercise.categories.includes('posture')) {
        return 2;
      }
      return 0;
    case 'posterior_chain':
      if (exercise.muscleGroup === 'glutes') {
        return 5;
      }
      if (
        exercise.muscleGroup === 'hamstrings' ||
        exercise.muscleGroup === 'outer thighs' ||
        exercise.muscleGroup === 'lower back'
      ) {
        return 3;
      }
      if (/\b(bridge|kickback|leg lift|swan|swimming)\b/i.test(exercise.name)) {
        return 2;
      }
      return 0;
    case 'mobility_recovery':
      if (exercise.sessionRole === 'warmup' || exercise.sessionRole === 'cooldown') {
        return 5;
      }
      if (exercise.categories.includes('flexibility') || exercise.categories.includes('mobility')) {
        return 4;
      }
      if (exercise.difficulty === 'beginner') {
        return 2;
      }
      if (exercise.difficulty === 'advanced') {
        return -4;
      }
      return 0;
    case 'full_body_control':
      if (
        exercise.muscleGroup === 'core' ||
        exercise.muscleGroup === 'glutes' ||
        exercise.muscleGroup === 'lower back' ||
        exercise.muscleGroup === 'outer thighs'
      ) {
        return 2;
      }
      return 0;
    default:
      return 0;
  }
}

function physiqueExerciseBonus(exercise: Exercise, physique?: PhysiquePlanContext): number {
  if (!physique) {
    return 0;
  }

  switch (physique.physiqueCategory) {
    case 'higher_body_fat':
      if (exercise.difficulty === 'beginner') {
        return 2;
      }
      if (
        exercise.categories.includes('pilates') ||
        exercise.categories.includes('core') ||
        exercise.categories.includes('flexibility')
      ) {
        return 2;
      }
      if (exercise.difficulty === 'advanced') {
        return -2;
      }
      return 0;
    case 'athletic':
    case 'lean':
      if (exercise.difficulty === 'advanced' || exercise.difficulty === 'intermediate') {
        return 2;
      }
      if (exercise.categories.includes('pilates') || exercise.categories.includes('core')) {
        return 1;
      }
      return 0;
    case 'average':
      if (exercise.categories.includes('pilates') || exercise.categories.includes('core')) {
        return 1;
      }
      return 0;
    default:
      return 0;
  }
}

function scoreExercise(
  exercise: Exercise,
  profile: Profile,
  muscleGroupCounts: Map<string, number>,
  deprioritizedIds: Set<string>,
  planDate: string,
  focus: WorkoutFocus,
  intensity: WorkoutIntensity,
  physique?: PhysiquePlanContext,
): number {
  let score =
    pilatesAffinityScore(exercise, profile) +
    physiqueExerciseBonus(exercise, physique) +
    focusExerciseBonus(exercise, focus) +
    dateVarietyBonus(exercise, planDate);

  if (deprioritizedIds.has(exercise.id)) {
    score -= 5;
  }
  const muscleGroupCount = muscleGroupCounts.get(exercise.muscleGroup) ?? 0;
  if (muscleGroupCount === 0) {
    score += 2;
  } else if (muscleGroupCount === 1) {
    score -= 3;
  } else {
    score -= 7 + muscleGroupCount;
  }
  if (profile.fitnessGoal === 'get_toned' && exercise.difficulty === 'intermediate') {
    score += 1;
  }
  if (profile.fitnessGoal === 'build_muscle' && exercise.difficulty !== 'beginner') {
    score += 1;
  }

  if (intensity === 'lighter') {
    if (exercise.difficulty === 'beginner') {
      score += 2;
    }
    if (exercise.difficulty === 'advanced') {
      score -= 4;
    }
  } else if (intensity === 'challenging') {
    if (exercise.difficulty === 'advanced') {
      score += 3;
    }
    if (exercise.difficulty === 'intermediate') {
      score += 1;
    }
    if (exercise.difficulty === 'beginner') {
      score -= 2;
    }
  }

  return score;
}

function countMuscleGroups(exercises: Exercise[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const exercise of exercises) {
    counts.set(exercise.muscleGroup, (counts.get(exercise.muscleGroup) ?? 0) + 1);
  }
  return counts;
}

function targetDistinctMuscleGroups(candidates: Exercise[], targetMin: number): number {
  return Math.min(
    TARGET_DISTINCT_MUSCLE_GROUPS,
    new Set(candidates.map((exercise) => exercise.muscleGroup)).size,
    targetMin,
  );
}

function selectBalancedExercises(
  candidates: Exercise[],
  profile: Profile,
  deprioritizedIds: Set<string>,
  planDate: string,
  controls: PlanControls,
  physique?: PhysiquePlanContext,
): Exercise[] {
  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();
  const targetGroups = targetDistinctMuscleGroups(candidates, controls.targetMin);

  while (selected.length < controls.targetMax && selected.length < candidates.length) {
    const muscleGroupCounts = countMuscleGroups(selected);
    const distinctGroups = muscleGroupCounts.size;
    const shouldPrioritizeNewGroup =
      selected.length < controls.targetMin && distinctGroups < targetGroups;

    const next = candidates
      .filter((exercise) => !selectedIds.has(exercise.id))
      .sort((a, b) => {
        if (shouldPrioritizeNewGroup) {
          const aNewGroup = !muscleGroupCounts.has(a.muscleGroup);
          const bNewGroup = !muscleGroupCounts.has(b.muscleGroup);
          if (aNewGroup !== bNewGroup) {
            return aNewGroup ? -1 : 1;
          }
        }

        return (
          scoreExercise(
            b,
            profile,
            muscleGroupCounts,
            deprioritizedIds,
            planDate,
            controls.focus,
            controls.intensity,
            physique,
          ) -
          scoreExercise(
            a,
            profile,
            muscleGroupCounts,
            deprioritizedIds,
            planDate,
            controls.focus,
            controls.intensity,
            physique,
          )
        );
      })[0];

    if (!next) {
      break;
    }

    selected.push(next);
    selectedIds.add(next.id);
  }

  return selected;
}

function sessionRoleOrder(exercise: Exercise): number {
  switch (exercise.sessionRole) {
    case 'warmup':
      return 0;
    case 'main':
      return 1;
    case 'cooldown':
      return 2;
    default:
      return 1;
  }
}

function orderWorkoutFlow(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => sessionRoleOrder(a) - sessionRoleOrder(b));
}

function setsForExercise(
  profile: Profile,
  exercise: Exercise,
  focus: WorkoutFocus,
  intensity: WorkoutIntensity,
): number {
  let sets: number;
  if (focus === 'mobility_recovery' && exercise.difficulty === 'beginner') {
    sets = 2;
  } else if (
    profile.fitnessGoal === 'build_muscle' &&
    focus !== 'mobility_recovery' &&
    exercise.difficulty !== 'beginner'
  ) {
    sets = 4;
  } else {
    sets = exercise.difficulty === 'advanced' ? 4 : 3;
  }

  if (intensity === 'lighter') {
    return Math.max(2, sets - 1);
  }
  if (intensity === 'challenging') {
    return Math.min(5, sets + 1);
  }
  return sets;
}

export function validatePlanExerciseIds(
  planExercises: WorkoutPlanExercise[],
  library: Exercise[],
): boolean {
  const libraryIds = new Set(library.map((exercise) => exercise.id));
  return planExercises.every((item) => libraryIds.has(item.exerciseId));
}

export function generateWorkoutPlan(
  profile: Profile,
  exercises: Exercise[],
  planDate: string,
  planId: string,
  adaptation?: AdaptationContext,
  physique?: PhysiquePlanContext,
  overrides?: WorkoutGenerationOverrides,
): WorkoutPlan {
  const deprioritizedIds = adaptation?.skippedFrequentIds ?? new Set<string>();
  const pilatesPool = selectPilatesCandidatePool(exercises);
  const controls = resolvePlanControls(profile, planDate, overrides);

  const preferencePool = pilatesPool.filter(
    (exercise) =>
      exercise.tags.some((tag) => profile.exercisePreferences.includes(tag)) ||
      isPilatesAlignedExercise(exercise),
  );

  const candidates =
    preferencePool.length >= TARGET_MIN
      ? preferencePool
      : pilatesPool.filter((exercise) => !deprioritizedIds.has(exercise.id));

  const finalCandidates =
    candidates.length >= TARGET_MIN
      ? candidates
      : pilatesPool.length >= TARGET_MIN
        ? pilatesPool
        : exercises.filter((exercise) => !deprioritizedIds.has(exercise.id));

  const selected = selectBalancedExercises(
    finalCandidates,
    profile,
    deprioritizedIds,
    planDate,
    controls,
    physique,
  );

  while (selected.length < controls.targetMin && selected.length < finalCandidates.length) {
    const next = finalCandidates.find(
      (exercise) => !selected.some((item) => item.id === exercise.id),
    );
    if (!next) {
      break;
    }
    selected.push(next);
  }

  let pilatesAlignedCount = selected.filter(isPilatesAlignedExercise).length;
  if (pilatesAlignedCount < MIN_PILATES_ALIGNED && pilatesPool.length >= MIN_PILATES_ALIGNED) {
    const selectedIds = new Set(selected.map((exercise) => exercise.id));
    const upgrades = [...pilatesPool]
      .filter((exercise) => !selectedIds.has(exercise.id))
      .sort(
        (a, b) =>
          scoreExercise(
            b,
            profile,
            countMuscleGroups(selected),
            deprioritizedIds,
            planDate,
            controls.focus,
            controls.intensity,
            physique,
          ) -
          scoreExercise(
            a,
            profile,
            countMuscleGroups(selected),
            deprioritizedIds,
            planDate,
            controls.focus,
            controls.intensity,
            physique,
          ),
      );

    for (const upgrade of upgrades) {
      if (pilatesAlignedCount >= MIN_PILATES_ALIGNED) {
        break;
      }
      const replaceIndex = selected.findIndex((exercise) => !isPilatesAlignedExercise(exercise));
      if (replaceIndex === -1) {
        break;
      }
      selectedIds.delete(selected[replaceIndex]!.id);
      selected[replaceIndex] = upgrade;
      selectedIds.add(upgrade.id);
      pilatesAlignedCount += 1;
    }
  }

  let planExercises: WorkoutPlanExercise[] = orderWorkoutFlow(selected).map((exercise, index) => ({
    exerciseId: exercise.id,
    sortOrder: index + 1,
    sets: setsForExercise(profile, exercise, controls.focus, controls.intensity),
    reps: exercise.repsBaseline,
    holdSeconds: exercise.holdSeconds,
  }));

  if (adaptation && adaptation.lastSessionFeedback.length > 0) {
    planExercises = swapSkippedExercises(planExercises, adaptation.lastSessionFeedback, adaptation);
  }

  if (planExercises.length < controls.targetMin) {
    throw new Error(`Plan must include at least ${controls.targetMin} exercises.`);
  }

  if (!validatePlanExerciseIds(planExercises, exercises)) {
    throw new Error('Plan contains exercises outside the seeded library.');
  }

  return {
    id: planId,
    planDate,
    exercises: planExercises.slice(0, controls.targetMax),
    source: 'deterministic',
    generatedAt: new Date().toISOString(),
  };
}
