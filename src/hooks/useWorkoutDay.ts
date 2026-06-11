import { useCallback, useEffect, useRef, useState } from 'react';

import { loadWorkoutDay } from '@/engines/workout';
import type { PlanGenerationErrorCode, WorkoutDayView } from '@/types/workout';
import { PlanGenerationError } from '@/types/workout';

interface WorkoutDayState {
  data: WorkoutDayView | null;
  isLoading: boolean;
  isRefreshing: boolean;
  errorCode: PlanGenerationErrorCode | null;
  errorMessage: string | null;
  reload: () => Promise<void>;
}

export function useWorkoutDay(planDate: string): WorkoutDayState {
  const [data, setData] = useState<WorkoutDayView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorCode, setErrorCode] = useState<PlanGenerationErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const reload = useCallback(async () => {
    setIsLoading(!hasLoadedOnceRef.current);
    setIsRefreshing(hasLoadedOnceRef.current);
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const day = await loadWorkoutDay(planDate);
      setData(day);
      hasLoadedOnceRef.current = true;
    } catch (error) {
      setData(null);
      if (error instanceof PlanGenerationError) {
        setErrorCode(error.code);
        setErrorMessage(error.message);
      } else {
        setErrorCode('UNKNOWN');
        setErrorMessage('Something went wrong loading your workout.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [planDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, isLoading, isRefreshing, errorCode, errorMessage, reload };
}
