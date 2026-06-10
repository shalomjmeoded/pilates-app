import { format } from 'date-fns';
import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import { mapNutritionTargetRow } from '@/db/mappers';
import { buildBaselinePlan } from '@/engines/calculations';
import { buildCalculationInput } from '@/engines/physique/bodyFatAssumptions';
import { getLatestPhysiqueAssessment } from '@/db/repositories/physiqueAssessmentRepository';
import { buildNutritionDaySummary } from '@/engines/nutrition/summaries';
import { getProfile } from '@/db/repositories/profileRepository';
import type {
  Meal,
  MealInput,
  MealUpdateInput,
  NutritionDailyTotalsRow,
  NutritionTargets,
} from '@/types/nutrition';

interface NutritionTargetRow {
  id: string;
  effective_date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  is_manual_override: number;
  created_at: string;
}

interface MealRow {
  id: string;
  meal_date: string;
  logged_at: string;
  title: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  portion_multiplier: number;
  source: Meal['source'];
  ai_confidence: number | null;
  ai_ingredients_json: string | null;
}

interface DailyTotalsRow {
  meal_date: string;
  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_count: number;
  nutrition_score: number;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  target_fiber_g: number;
  updated_at: string;
}

function mapMealRow(row: MealRow): Meal {
  return {
    id: row.id,
    mealDate: row.meal_date,
    loggedAt: row.logged_at,
    title: row.title,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
    portionMultiplier: row.portion_multiplier,
    source: row.source,
    aiConfidence: row.ai_confidence ?? undefined,
    aiIngredients: row.ai_ingredients_json
      ? (JSON.parse(row.ai_ingredients_json) as Meal['aiIngredients'])
      : undefined,
  };
}

function mapDailyTotalsRow(row: DailyTotalsRow): NutritionDailyTotalsRow {
  return {
    mealDate: row.meal_date,
    caloriesConsumed: row.calories_consumed,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
    mealCount: row.meal_count,
    nutritionScore: row.nutrition_score,
    targetCalories: row.target_calories,
    targetProteinG: row.target_protein_g,
    targetCarbsG: row.target_carbs_g,
    targetFatG: row.target_fat_g,
    targetFiberG: row.target_fiber_g,
    updatedAt: row.updated_at,
  };
}

export async function saveNutritionTargets(targets: NutritionTargets): Promise<string> {
  const db = await getDatabase();
  const id = targets.id ?? createId();

  await db.runAsync(
    `INSERT INTO nutrition_targets (
      id, effective_date, calories, protein_g, carbs_g, fat_g, fiber_g, is_manual_override
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    targets.effectiveDate,
    targets.calories,
    targets.proteinG,
    targets.carbsG,
    targets.fatG,
    targets.fiberG,
    targets.isManualOverride ? 1 : 0,
  );

  return id;
}

export async function upsertNutritionTargets(targets: NutritionTargets): Promise<string> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM nutrition_targets WHERE effective_date = ? LIMIT 1',
    targets.effectiveDate,
  );

  if (existing) {
    await db.runAsync(
      `UPDATE nutrition_targets SET
        calories = ?,
        protein_g = ?,
        carbs_g = ?,
        fat_g = ?,
        fiber_g = ?,
        is_manual_override = ?
      WHERE id = ?`,
      targets.calories,
      targets.proteinG,
      targets.carbsG,
      targets.fatG,
      targets.fiberG,
      targets.isManualOverride ? 1 : 0,
      existing.id,
    );
    return existing.id;
  }

  return saveNutritionTargets(targets);
}

export async function getAllNutritionTargets(): Promise<NutritionTargets[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<NutritionTargetRow>(
    'SELECT * FROM nutrition_targets ORDER BY effective_date ASC, created_at ASC',
  );
  return rows.map(mapNutritionTargetRow);
}

export async function getActiveNutritionTargets(date: string): Promise<NutritionTargets | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<NutritionTargetRow>(
    `SELECT * FROM nutrition_targets
     WHERE effective_date <= ?
     ORDER BY effective_date DESC, created_at DESC
     LIMIT 1`,
    date,
  );

  return row ? mapNutritionTargetRow(row) : null;
}

export async function getOrCreateNutritionTargets(date: string): Promise<NutritionTargets | null> {
  const existing = await getActiveNutritionTargets(date);
  if (existing) {
    return existing;
  }

  const profile = await getProfile();
  if (!profile) {
    return null;
  }

  const latestPhysique = await getLatestPhysiqueAssessment();
  const plan = buildBaselinePlan(buildCalculationInput(profile, latestPhysique));

  const targets: NutritionTargets = {
    ...plan.macros,
    effectiveDate: format(new Date(), 'yyyy-MM-dd'),
    isManualOverride: false,
  };

  const id = await upsertNutritionTargets(targets);
  return { ...targets, id };
}

export async function getMealsForDate(date: string): Promise<Meal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MealRow>(
    'SELECT * FROM meals WHERE meal_date = ? ORDER BY logged_at DESC',
    date,
  );

  return rows.map(mapMealRow);
}

export async function getMealById(id: string): Promise<Meal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MealRow>('SELECT * FROM meals WHERE id = ?', id);
  return row ? mapMealRow(row) : null;
}

export async function saveMeal(input: MealInput): Promise<Meal> {
  const db = await getDatabase();
  const id = createId();
  const loggedAt = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO meals (
      id, meal_date, logged_at, title, calories, protein_g, carbs_g, fat_g, fiber_g,
      portion_multiplier, source, ai_confidence, ai_ingredients_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1.0, ?, ?, ?)`,
    id,
    input.mealDate,
    loggedAt,
    input.title.trim(),
    input.calories,
    input.proteinG,
    input.carbsG,
    input.fatG,
    input.fiberG,
    input.source,
    input.aiConfidence ?? null,
    input.aiIngredients ? JSON.stringify(input.aiIngredients) : null,
  );

  await syncDailyTotalsForDate(input.mealDate);

  return {
    id,
    mealDate: input.mealDate,
    loggedAt,
    title: input.title.trim(),
    calories: input.calories,
    proteinG: input.proteinG,
    carbsG: input.carbsG,
    fatG: input.fatG,
    fiberG: input.fiberG,
    portionMultiplier: 1,
    source: input.source,
    aiConfidence: input.aiConfidence,
    aiIngredients: input.aiIngredients,
  };
}

export async function updateMealPortion(mealId: string, portionMultiplier: number): Promise<void> {
  const db = await getDatabase();
  const meal = await getMealById(mealId);
  if (!meal) {
    return;
  }

  await db.runAsync('UPDATE meals SET portion_multiplier = ? WHERE id = ?', portionMultiplier, mealId);
  await syncDailyTotalsForDate(meal.mealDate);
}

export async function deleteMeal(mealId: string): Promise<void> {
  const db = await getDatabase();
  const meal = await getMealById(mealId);
  if (!meal) {
    return;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM meals WHERE id = ?', mealId);
  });
  await syncDailyTotalsForDate(meal.mealDate);
}

export async function updateMeal(mealId: string, input: MealUpdateInput): Promise<Meal | null> {
  const db = await getDatabase();
  const existing = await getMealById(mealId);
  if (!existing) {
    return null;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE meals SET
        title = ?, calories = ?, protein_g = ?, carbs_g = ?, fat_g = ?, fiber_g = ?, logged_at = ?
      WHERE id = ?`,
      input.title.trim(),
      input.calories,
      input.proteinG,
      input.carbsG,
      input.fatG,
      input.fiberG,
      input.loggedAt,
      mealId,
    );
  });

  await syncDailyTotalsForDate(existing.mealDate);
  return getMealById(mealId);
}

export async function duplicateMeal(mealId: string, targetMealDate: string): Promise<Meal | null> {
  const source = await getMealById(mealId);
  if (!source) {
    return null;
  }

  return saveMeal({
    title: source.title,
    calories: source.calories,
    proteinG: source.proteinG,
    carbsG: source.carbsG,
    fatG: source.fatG,
    fiberG: source.fiberG,
    source: source.source,
    mealDate: targetMealDate,
  });
}

export async function getRecentMeals(limit: number = 10): Promise<Meal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MealRow>(
    'SELECT * FROM meals ORDER BY logged_at DESC LIMIT ?',
    limit,
  );
  return rows.map(mapMealRow);
}

export async function getRecentDailyTotals(limit: number = 7): Promise<NutritionDailyTotalsRow[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DailyTotalsRow>(
    `SELECT * FROM nutrition_daily_totals
     ORDER BY meal_date DESC
     LIMIT ?`,
    limit,
  );

  return rows.map(mapDailyTotalsRow);
}

export async function countMeals(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM meals');
  return row?.count ?? 0;
}

export async function getDailyTotals(date: string): Promise<NutritionDailyTotalsRow | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DailyTotalsRow>(
    'SELECT * FROM nutrition_daily_totals WHERE meal_date = ?',
    date,
  );

  return row ? mapDailyTotalsRow(row) : null;
}

export async function syncDailyTotalsForDate(mealDate: string): Promise<NutritionDailyTotalsRow | null> {
  const targets = await getOrCreateNutritionTargets(mealDate);
  if (!targets) {
    return null;
  }

  const meals = await getMealsForDate(mealDate);
  const summary = buildNutritionDaySummary(mealDate, targets, meals);
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO nutrition_daily_totals (
      meal_date, calories_consumed, protein_g, carbs_g, fat_g, fiber_g,
      meal_count, nutrition_score, target_calories, target_protein_g,
      target_carbs_g, target_fat_g, target_fiber_g, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(meal_date) DO UPDATE SET
      calories_consumed = excluded.calories_consumed,
      protein_g = excluded.protein_g,
      carbs_g = excluded.carbs_g,
      fat_g = excluded.fat_g,
      fiber_g = excluded.fiber_g,
      meal_count = excluded.meal_count,
      nutrition_score = excluded.nutrition_score,
      target_calories = excluded.target_calories,
      target_protein_g = excluded.target_protein_g,
      target_carbs_g = excluded.target_carbs_g,
      target_fat_g = excluded.target_fat_g,
      target_fiber_g = excluded.target_fiber_g,
      updated_at = datetime('now')`,
    mealDate,
    summary.consumed.calories,
    summary.consumed.proteinG,
    summary.consumed.carbsG,
    summary.consumed.fatG,
    summary.consumed.fiberG,
    summary.mealCount,
    summary.nutritionScore,
    targets.calories,
    targets.proteinG,
    targets.carbsG,
    targets.fatG,
    targets.fiberG,
  );

  return getDailyTotals(mealDate);
}
