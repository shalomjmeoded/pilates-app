import { addDays, parseISO } from 'date-fns';

import { getSessionForPlan, getWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { formatPlanDate } from '@/engines/workout';
import { refreshWorkoutPlanForDate } from '@/engines/workout/repairStalePlan';
import type { WorkoutGenerationOverrides } from '@/types/workout';

export interface WorkoutRegenerationResult {
  regeneratedDates: string[];
  skippedDates: string[];
}

export async function regenerateUpcomingWorkoutPlans(
  startDate: string,
  overrides: WorkoutGenerationOverrides,
  days = 7,
): Promise<WorkoutRegenerationResult> {
  const regeneratedDates: string[] = [];
  const skippedDates: string[] = [];
  const start = parseISO(`${startDate}T00:00:00.000Z`);

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const planDate = formatPlanDate(addDays(start, dayOffset));
    const existing = await getWorkoutPlanByDate(planDate);

    if (existing) {
      const session = await getSessionForPlan(existing.id);
      if (session?.status === 'completed' || session?.status === 'in_progress') {
        skippedDates.push(planDate);
        continue;
      }
    }

    await refreshWorkoutPlanForDate(planDate, overrides, { allowFutureGeneration: true });
    regeneratedDates.push(planDate);
  }

  return { regeneratedDates, skippedDates };
}
