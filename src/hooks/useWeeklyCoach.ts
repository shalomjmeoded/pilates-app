import { useCallback, useState } from 'react';

import {
  generateWeeklyCoachInsight,
  getCachedWeeklyCoachInsight,
} from '@/services/coaching/weeklyCoachService';
import type { WeeklyCoachInsightContent } from '@/types/coaching';

export function useWeeklyCoach() {
  const [insight, setInsight] = useState<WeeklyCoachInsightContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cached = await getCachedWeeklyCoachInsight();
      setInsight(cached);
      return cached;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load weekly coach.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const generated = await generateWeeklyCoachInsight({ notify: true });
      setInsight(generated);
      return generated;
    } catch (generateError) {
      setError(
        generateError instanceof Error ? generateError.message : 'Could not generate weekly coach.',
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    insight,
    isLoading,
    error,
    load,
    generate,
  };
}
