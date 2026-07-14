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
import {
  defaultTargetMinutesForProfile,
  exerciseCountBoundsForMinutes,
} from './sessionDurationBounds';

export interface PhysiquePlanContext {
  physiqueCategory: PhysiqueCategory;
}

export type WorkoutFocus = 'core_control' | 'posterior_chain' | 'mobility_recovery' | 'full_body_control';

const TARGET_DISTINCT_MUSCLE_GROUPS = 4;
const DATE_VARIETY_WEIGHT = 6;
const RECENT_EXERCISE_PENALTY = 3;

interface PlanControls {
  focus: WorkoutFocus;
  targetMin: number;
  targetMax: number;
  targetMinutes: number;
  intensity: WorkoutIntensity;
}

const GOAL_WEEKLY_FOCUS: Record<Profile['fitnessGoal'], WorkoutFocus[]> = {
  lose_weight: [
    'full_body_control',
    'core_control',
    'posterior_chain',
    'full_body_control',
    'mobility_recovery',
    'core_control',
    'full_body_control',
  ],
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

function resolvePlanControls(
  profile: Profile,
  planDate: string,
  overrides?: WorkoutGenerationOverrides,
): PlanControls {
  const intensity = overrides?.intensity ?? 'balanced';
  const focus = overrides?.focusArea
    ? mapFocusAreaToWorkoutFocus(overrides.focusArea)
    : weeklyFocusFor(profile, planDate);
  const targetMinutes =
    overrides?.targetMinutes ?? defaultTargetMinutesForProfile(profile.trainingFrequency);
  const bounds = exerciseCountBoundsForMinutes(targetMinutes);

  return {
    focus,
    targetMin: bounds.minExercises,
    targetMax: bounds.maxExercises,
    targetMinutes,
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
  recentExerciseCounts: Record<string, number>,
  physique?: PhysiquePlanContext,
): number {
  let score =
    pilatesAffinityScore(exercise, profile) +
    physiqueExerciseBonus(exercise, physique) +
    focusExerciseBonus(exercise, focus) +
    dateVarietyBonus(exercise, planDate);

  // Prefer Pilates mains; keep stretch/warmup/cooldown as accessories unless recovery focus.
  if (focus !== 'mobility_recovery') {
    if (exercise.sessionRole === 'main' && exercise.categories.includes('pilates')) {
      score += 6;
    }
    if (exercise.sessionRole === 'warmup') {
      score -= 8;
    }
    if (exercise.sessionRole === 'cooldown') {
      score -= 6;
    }
    if (
      exercise.categories.includes('flexibility') &&
      !profile.exercisePreferences.includes('flexibility_length')
    ) {
      score -= 4;
    }
  }

  score -= Math.min(9, (recentExerciseCounts[exercise.id] ?? 0) * RECENT_EXERCISE_PENALTY);

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

const MAX_WARMUP_IN_PLAN = 2;
const MAX_COOLDOWN_IN_PLAN = 1;

function selectBalancedExercises(
  candidates: Exercise[],
  profile: Profile,
  deprioritizedIds: Set<string>,
  planDate: string,
  controls: PlanControls,
  recentExerciseCounts: Record<string, number>,
  physique?: PhysiquePlanContext,
): Exercise[] {
  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();
  const targetGroups = targetDistinctMuscleGroups(candidates, controls.targetMin);
  const capAccessories = controls.focus !== 'mobility_recovery';

  while (selected.length < controls.targetMax && selected.length < candidates.length) {
    const muscleGroupCounts = countMuscleGroups(selected);
    const distinctGroups = muscleGroupCounts.size;
    const shouldPrioritizeNewGroup =
      selected.length < controls.targetMin && distinctGroups < targetGroups;
    const warmupCount = selected.filter((exercise) => exercise.sessionRole === 'warmup').length;
    const cooldownCount = selected.filter((exercise) => exercise.sessionRole === 'cooldown').length;

    const next = candidates
      .filter((exercise) => {
        if (selectedIds.has(exercise.id)) {
          return false;
        }
        if (!capAccessories) {
          return true;
        }
        if (exercise.sessionRole === 'warmup' && warmupCount >= MAX_WARMUP_IN_PLAN) {
          return false;
        }
        if (exercise.sessionRole === 'cooldown' && cooldownCount >= MAX_COOLDOWN_IN_PLAN) {
          return false;
        }
        return true;
      })
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
            recentExerciseCounts,
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
            recentExerciseCounts,
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
  lastSessionDifficulty?: AdaptationContext['lastSessionDifficulty'],
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
    sets = Math.max(2, sets - 1);
  } else if (intensity === 'challenging') {
    sets = Math.min(5, sets + 1);
  }

  if (lastSessionDifficulty === 'too_easy') {
    return Math.min(5, sets + 1);
  }
  if (lastSessionDifficulty === 'too_hard') {
    return Math.max(2, sets - 1);
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

function ensureWarmupBookend(
  selected: Exercise[],
  candidates: Exercise[],
  focus: WorkoutFocus,
): Exercise[] {
  const targetWarmups = focus === 'mobility_recovery' ? MAX_WARMUP_IN_PLAN : 1;
  let next = [...selected];
  let warmupCount = next.filter((exercise) => exercise.sessionRole === 'warmup').length;
  if (warmupCount >= targetWarmups) {
    return next;
  }

  const selectedIds = new Set(next.map((exercise) => exercise.id));
  const warmups = candidates.filter(
    (exercise) => exercise.sessionRole === 'warmup' && !selectedIds.has(exercise.id),
  );

  for (const warmup of warmups) {
    if (warmupCount >= targetWarmups) {
      break;
    }
    const lastMainIndex = [...next]
      .map((exercise, index) => ({ exercise, index }))
      .reverse()
      .find((entry) => entry.exercise.sessionRole === 'main')?.index;

    if (lastMainIndex === undefined) {
      next = [warmup, ...next];
    } else {
      next[lastMainIndex] = warmup;
    }
    selectedIds.add(warmup.id);
    warmupCount += 1;
  }

  return next;
}

function backfillExercises(
  selected: Exercise[],
  pools: Exercise[][],
  targetMin: number,
): Exercise[] {
  const filled = [...selected];
  const selectedIds = new Set(filled.map((exercise) => exercise.id));

  for (const pool of pools) {
    if (filled.length >= targetMin) {
      break;
    }
    for (const exercise of pool) {
      if (filled.length >= targetMin) {
        break;
      }
      if (selectedIds.has(exercise.id)) {
        continue;
      }
      filled.push(exercise);
      selectedIds.add(exercise.id);
    }
  }

  return filled;
}

export function generateWorkoutPlan(
  profile: Profile,
  exercises: Exercise[],
  planDate: string,
  planId: string,
  adaptation?: AdaptationContext,
  physique?: PhysiquePlanContext,
  overrides?: WorkoutGenerationOverrides,
  availableEquipment?: ReadonlyArray<
    'reformer' | 'resistance band' | 'magic circle' | 'light weights' | 'pilates ball'
  >,
): WorkoutPlan {
  const deprioritizedIds = adaptation?.skippedFrequentIds ?? new Set<string>();
  const controls = resolvePlanControls(profile, planDate, overrides);
  const recentExerciseCounts = adaptation?.recentExerciseCounts ?? {};

  // Progressive pools: prefer equipment + preferences, then widen until the duration floor is met.
  const equippedPool = selectPilatesCandidatePool(exercises, availableEquipment);
  const openPilatesPool = selectPilatesCandidatePool(exercises);
  const preferencePool = equippedPool.filter(
    (exercise) =>
      exercise.tags.some((tag) => profile.exercisePreferences.includes(tag)) ||
      isPilatesAlignedExercise(exercise),
  );
  const deprioritizedFiltered = (pool: Exercise[]) =>
    pool.filter((exercise) => !deprioritizedIds.has(exercise.id));

  const candidatePools: Exercise[][] = [
    preferencePool,
    deprioritizedFiltered(equippedPool),
    equippedPool,
    deprioritizedFiltered(openPilatesPool),
    openPilatesPool,
    deprioritizedFiltered(exercises),
    exercises,
  ];

  let workingPool =
    candidatePools.find((pool) => pool.length >= controls.targetMin) ??
    exercises;

  let selected = selectBalancedExercises(
    workingPool,
    profile,
    deprioritizedIds,
    planDate,
    controls,
    recentExerciseCounts,
    physique,
  );

  if (selected.length < controls.targetMin) {
    selected = backfillExercises(selected, candidatePools, controls.targetMin);
  }

  // If still short, try selecting again from the widest pool that can satisfy the floor.
  if (selected.length < controls.targetMin) {
    const widePool =
      candidatePools.find((pool) => pool.length >= controls.targetMin) ?? exercises;
    workingPool = widePool;
    selected = selectBalancedExercises(
      widePool,
      profile,
      deprioritizedIds,
      planDate,
      controls,
      recentExerciseCounts,
      physique,
    );
    selected = backfillExercises(selected, candidatePools, controls.targetMin);
  }

  const minPilatesAligned = Math.min(controls.targetMin, Math.max(3, controls.targetMin - 1));
  let pilatesAlignedCount = selected.filter(isPilatesAlignedExercise).length;
  if (pilatesAlignedCount < minPilatesAligned && openPilatesPool.length >= minPilatesAligned) {
    const selectedIds = new Set(selected.map((exercise) => exercise.id));
    const upgrades = [...openPilatesPool]
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
            recentExerciseCounts,
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
            recentExerciseCounts,
            physique,
          ),
      );

    for (const upgrade of upgrades) {
      if (pilatesAlignedCount >= minPilatesAligned) {
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

  // Failsafe: never drop below the duration floor after pilates upgrades.
  if (selected.length < controls.targetMin) {
    selected = backfillExercises(selected, candidatePools, controls.targetMin);
  }

  selected = ensureWarmupBookend(selected, workingPool, controls.focus);

  let planExercises: WorkoutPlanExercise[] = orderWorkoutFlow(selected).map((exercise, index) => ({
    exerciseId: exercise.id,
    sortOrder: index + 1,
    sets: setsForExercise(
      profile,
      exercise,
      controls.focus,
      controls.intensity,
      adaptation?.lastSessionDifficulty,
    ),
    reps: exercise.repsBaseline,
    holdSeconds: exercise.holdSeconds,
  }));

  if (adaptation && adaptation.lastSessionFeedback.length > 0) {
    planExercises = swapSkippedExercises(planExercises, adaptation.lastSessionFeedback, adaptation);
  }

  // Re-assert floor after skip swaps (1:1 replacements should preserve length).
  if (planExercises.length < controls.targetMin) {
    const knownIds = new Set(planExercises.map((item) => item.exerciseId));
    const filler = backfillExercises(
      planExercises
        .map((item) => exercises.find((exercise) => exercise.id === item.exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise)),
      candidatePools,
      controls.targetMin,
    );
    planExercises = orderWorkoutFlow(filler).map((exercise, index) => {
      const existing = planExercises.find((item) => item.exerciseId === exercise.id);
      if (existing) {
        return { ...existing, sortOrder: index + 1 };
      }
      knownIds.add(exercise.id);
      return {
        exerciseId: exercise.id,
        sortOrder: index + 1,
        sets: setsForExercise(
          profile,
          exercise,
          controls.focus,
          controls.intensity,
          adaptation?.lastSessionDifficulty,
        ),
        reps: exercise.repsBaseline,
        holdSeconds: exercise.holdSeconds,
      };
    });
  }

  if (planExercises.length < controls.targetMin) {
    throw new Error(
      `Plan must include at least ${controls.targetMin} exercises for a ${controls.targetMinutes}-minute session.`,
    );
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
