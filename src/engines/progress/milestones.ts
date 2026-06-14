import type { MilestoneDefinition, MilestoneKey, MilestoneStatus } from '@/types/progress';

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    key: 'first_weight_logged',
    title: 'First weigh-in',
    description: 'You logged your first weight entry.',
  },
  {
    key: 'five_workouts_completed',
    title: 'Five sessions',
    description: 'You completed five workouts.',
  },
  {
    key: 'ten_meals_logged',
    title: 'Ten meals tracked',
    description: 'You logged ten meals.',
  },
  {
    key: 'first_week_completed',
    title: 'First week',
    description: 'You stayed with BetterMe for seven days.',
  },
];

export interface MilestoneCheckInput {
  weightLogCount: number;
  completedWorkoutCount: number;
  mealCount: number;
  daysSinceOnboarding: number;
  unlockedKeys: Set<string>;
}

export function evaluateMilestones(input: MilestoneCheckInput): MilestoneKey[] {
  const newlyUnlocked: MilestoneKey[] = [];

  const checks: Array<{ key: MilestoneKey; met: boolean }> = [
    { key: 'first_weight_logged', met: input.weightLogCount >= 1 },
    { key: 'five_workouts_completed', met: input.completedWorkoutCount >= 5 },
    { key: 'ten_meals_logged', met: input.mealCount >= 10 },
    { key: 'first_week_completed', met: input.daysSinceOnboarding >= 7 },
  ];

  for (const check of checks) {
    if (check.met && !input.unlockedKeys.has(check.key)) {
      newlyUnlocked.push(check.key);
    }
  }

  return newlyUnlocked;
}

export function buildMilestoneStatuses(
  unlocked: Array<{ key: MilestoneKey; unlockedAt: string }>,
): MilestoneStatus[] {
  const map = new Map(unlocked.map((item) => [item.key, item.unlockedAt]));

  return MILESTONE_DEFINITIONS.map((definition) => ({
    ...definition,
    unlocked: map.has(definition.key),
    unlockedAt: map.get(definition.key),
  }));
}
