import { useCallback, useEffect, useState } from 'react';

import { getCompletedWorkoutDatesBetween } from '@/db/repositories/workoutRepository';

export function useWorkoutCalendarCompletion(dates: string[]) {
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    if (dates.length === 0) {
      setCompletedDates(new Set());
      return;
    }

    const sorted = [...dates].sort();
    const rows = await getCompletedWorkoutDatesBetween(sorted[0], sorted[sorted.length - 1]);
    setCompletedDates(new Set(rows));
  }, [dates]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { completedDates, reload };
}
