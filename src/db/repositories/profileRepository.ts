import { getDatabase } from '@/db/connection';
import { mapProfileRow, profileToRow } from '@/db/mappers';
import type { Profile, ProfileRow } from '@/types/profile';

export async function getProfile(): Promise<Profile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  return row ? mapProfileRow(row) : null;
}

export async function updateProfileWeight(weightKg: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE profile SET current_weight_kg = ?, updated_at = datetime('now') WHERE id = 1`,
    weightKg,
  );
}

export async function saveProfile(profile: Profile): Promise<void> {
  const db = await getDatabase();
  const row = profileToRow(profile);
  const existing = await getProfile();

  if (existing) {
    await db.runAsync(
      `UPDATE profile SET
        gender_identity = ?,
        birth_year = ?,
        height_cm = ?,
        current_weight_kg = ?,
        goal_weight_kg = ?,
        training_frequency = ?,
        fitness_goal = ?,
        exercise_preferences = ?,
        media_preference = ?,
        nutrition_mode = ?,
        weight_trajectory = ?,
        pace_kg_per_week = ?,
        updated_at = datetime('now')
      WHERE id = 1`,
      row.gender_identity,
      row.birth_year,
      row.height_cm,
      row.current_weight_kg,
      row.goal_weight_kg,
      row.training_frequency,
      row.fitness_goal,
      row.exercise_preferences,
      row.media_preference,
      row.nutrition_mode,
      row.weight_trajectory,
      row.pace_kg_per_week,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO profile (
      id, gender_identity, birth_year, height_cm, current_weight_kg, goal_weight_kg,
      training_frequency, fitness_goal, exercise_preferences, media_preference,
      nutrition_mode, weight_trajectory, pace_kg_per_week
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    row.gender_identity,
    row.birth_year,
    row.height_cm,
    row.current_weight_kg,
    row.goal_weight_kg,
    row.training_frequency,
    row.fitness_goal,
    row.exercise_preferences,
    row.media_preference,
    row.nutrition_mode,
    row.weight_trajectory,
    row.pace_kg_per_week,
  );
}
