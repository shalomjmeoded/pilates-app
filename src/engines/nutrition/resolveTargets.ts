import { getOrCreateNutritionTargets } from '@/db/repositories/nutritionRepository';
import type { NutritionTargets } from '@/types/nutrition';

export async function resolveNutritionTargets(date: string): Promise<NutritionTargets | null> {
  return getOrCreateNutritionTargets(date);
}
