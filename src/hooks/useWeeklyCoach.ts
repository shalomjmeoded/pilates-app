import { useCallback, useState } from 'react';

import {
  generateWeeklyCoachInsight,
  getCachedWeeklyCoachInsight,
  loadWeeklyCoachReadiness,
} from '@/services/coaching/weeklyCoachService';
import type { WeeklyCoachReadiness } from '@/engines/coaching/weeklyCoachReadiness';
import type { WeeklyCoachInsightContent } from '@/types/coaching';

export function useWeeklyCoach() {
  const [insight, setInsight] = useState<WeeklyCoachInsightContent | null>(null);
  const [readiness, setReadiness] = useState<WeeklyCoachReadiness | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cached, nextReadiness] = await Promise.all([
        getCachedWeeklyCoachInsight(),
        loadWeeklyCoachReadiness(),
      ]);
      setInsight(cached);
      setReadiness(nextReadiness);
      return cached;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Could not load weekly coach.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextReadiness = await loadWeeklyCoachReadiness();
      setReadiness(nextReadiness);
      if (!nextReadiness.unlocked) {
        throw new Error(
          `Weekly AI Coach unlocks at ${nextReadiness.unlockThreshold}% logging. You’re at ${nextReadiness.overallPercent}%.`,
        );
      }
      const generated = await generateWeeklyCoachInsight({ notify: true });
      setInsight(generated);
      return generated;
    } catch (generateError) {
      const message =
        generateError instanceof Error ? generateError.message : 'Could not generate weekly coach.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    insight,
    readiness,
    isLoading,
    error,
    load,
    generate,
  };
}
