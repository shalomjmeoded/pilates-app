import { useCallback, useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';

import {
  getCompletedWorkoutDatesBetween,
  getPlannedWorkoutDatesBetween,
} from '@/db/repositories/workoutRepository';
import { buildWorkoutStreakStats, monthPrefix } from '@/engines/workout/streaks';
import type { WorkoutStreakStats } from '@/types/workout';

export function useWorkoutStreak() {
  const [stats, setStats] = useState<WorkoutStreakStats | null>(null);

  const reload = useCallback(async () => {
    const end = format(new Date(), 'yyyy-MM-dd');
    const start = format(subDays(new Date(), 90), 'yyyy-MM-dd');
    const completed = await getCompletedWorkoutDatesBetween(start, end);
    const planned = await getPlannedWorkoutDatesBetween(start, end);
    const built = buildWorkoutStreakStats(completed, planned, monthPrefix());
    setStats({
      currentStreak: built.currentStreak,
      longestStreak: built.longestStreak,
      monthlyCompletionPercent: built.monthlyCompletionPercent,
    });
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, reload };
}
