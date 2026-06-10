import { useCallback, useEffect, useState } from 'react';

import {
  getMealsForDate,
  getOrCreateNutritionTargets,
  syncDailyTotalsForDate,
} from '@/db/repositories/nutritionRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { buildNutritionDaySummary } from '@/engines/nutrition/summaries';
import type { Meal, NutritionDaySummary, NutritionDailyTotalsRow } from '@/types/nutrition';
import type { NutritionMode } from '@/types/profile';

interface NutritionDayState {
  summary: NutritionDaySummary | null;
  meals: Meal[];
  dailyTotals: NutritionDailyTotalsRow | null;
  nutritionMode: NutritionMode | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useNutritionDay(mealDate: string): NutritionDayState {
  const [summary, setSummary] = useState<NutritionDaySummary | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyTotals, setDailyTotals] = useState<NutritionDailyTotalsRow | null>(null);
  const [nutritionMode, setNutritionMode] = useState<NutritionMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profile = await getProfile();
      setNutritionMode(profile?.nutritionMode ?? null);

      if (profile?.nutritionMode === 'workouts_only') {
        setSummary(null);
        setMeals([]);
        setDailyTotals(null);
        return;
      }

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
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load nutrition.');
      setSummary(null);
      setMeals([]);
      setDailyTotals(null);
    } finally {
      setIsLoading(false);
    }
  }, [mealDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { summary, meals, dailyTotals, nutritionMode, isLoading, error, reload };
}
