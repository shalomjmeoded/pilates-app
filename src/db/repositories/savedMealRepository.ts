import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import type { SavedMeal, SavedMealInput } from '@/types/nutrition';

interface SavedMealRow {
  id: string;
  title: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  created_at: string;
}

function mapRow(row: SavedMealRow): SavedMeal {
  return {
    id: row.id,
    title: row.title,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
    createdAt: row.created_at,
  };
}

export async function getSavedMeals(): Promise<SavedMeal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SavedMealRow>(
    'SELECT * FROM saved_meals ORDER BY title ASC',
  );
  return rows.map(mapRow);
}

export async function saveSavedMeal(input: SavedMealInput): Promise<SavedMeal> {
  const db = await getDatabase();
  const id = createId();
  await db.runAsync(
    `INSERT INTO saved_meals (id, title, calories, protein_g, carbs_g, fat_g, fiber_g)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.title.trim(),
    input.calories,
    input.proteinG,
    input.carbsG,
    input.fatG,
    input.fiberG,
  );
  const row = await db.getFirstAsync<SavedMealRow>('SELECT * FROM saved_meals WHERE id = ?', id);
  if (!row) {
    throw new Error('Failed to save meal template.');
  }
  return mapRow(row);
}

export async function deleteSavedMeal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM saved_meals WHERE id = ?', id);
}

export async function findSavedMealByTitle(title: string): Promise<SavedMeal | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SavedMealRow>(
    'SELECT * FROM saved_meals WHERE LOWER(title) = LOWER(?) LIMIT 1',
    title.trim(),
  );
  return row ? mapRow(row) : null;
}

export async function upsertSavedMeal(input: SavedMealInput): Promise<SavedMeal> {
  const existing = await findSavedMealByTitle(input.title);
  if (!existing) {
    return saveSavedMeal(input);
  }

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE saved_meals SET
      calories = ?,
      protein_g = ?,
      carbs_g = ?,
      fat_g = ?,
      fiber_g = ?
    WHERE id = ?`,
    input.calories,
    input.proteinG,
    input.carbsG,
    input.fatG,
    input.fiberG,
    existing.id,
  );

  const row = await db.getFirstAsync<SavedMealRow>('SELECT * FROM saved_meals WHERE id = ?', existing.id);
  if (!row) {
    throw new Error('Failed to update saved meal template.');
  }
  return mapRow(row);
}
