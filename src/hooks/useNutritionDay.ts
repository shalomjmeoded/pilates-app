import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getMealsForDate,
  getOrCreateNutritionTargets,
  syncDailyTotalsForDate,
} from '@/db/repositories/nutritionRepository';
import { buildNutritionDaySummary } from '@/engines/nutrition/summaries';
import type { Meal, NutritionDaySummary, NutritionDailyTotalsRow } from '@/types/nutrition';

interface NutritionDayState {
  summary: NutritionDaySummary | null;
  meals: Meal[];
  dailyTotals: NutritionDailyTotalsRow | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useNutritionDay(mealDate: string): NutritionDayState {
  const [summary, setSummary] = useState<NutritionDaySummary | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<NutritionDailyTotalsRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const reload = useCallback(async () => {
    setIsLoading(!hasLoadedOnceRef.current);
    setIsRefreshing(hasLoadedOnceRef.current);
    setError(null);

    try {
      const targets = await getOrCreateNutritionTargets(mealDate);
      if (!targets) {
        setError('Nutrition targets unavailable. Complete onboarding first.');
        setSummary(null);
        setMeals([]);
        setDailyTotals(null);
        return;
      }

      const dayMeals = await getMealsForDate(mealDate);
      const daySummary = buildNutritionDaySummary(mealDate, targets, dayMeals);
      const totals = await syncDailyTotalsForDate(mealDate);

      setSummary(daySummary);
      setMeals(dayMeals);
      setDailyTotals(totals);
      hasLoadedOnceRef.current = true;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load nutrition.');
      setSummary(null);
      setMeals([]);
      setDailyTotals(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mealDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, meals, dailyTotals, isLoading, isRefreshing, error, reload };
}
