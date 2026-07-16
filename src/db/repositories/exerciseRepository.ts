import { getDatabase } from '@/db/connection';
import { mapExerciseRow } from '@/db/mappers';
import type { Exercise, ExerciseRow } from '@/types/exercise';

const INSERT_COLUMNS = `id, name, description, instructions_json, common_mistakes_json,
          difficulty, muscle_group, secondary_muscles_json, equipment,
          reps_baseline, hold_seconds, calories_factor,
          thumbnail_uri, gif_uri, tags_json, categories_json, session_role, source,
          youtube_video_id, youtube_attribution`;

function insertParams(exercise: Exercise): Array<string | number | null> {
  return [
    exercise.id,
    exercise.name,
    exercise.description,
    JSON.stringify(exercise.instructions),
    JSON.stringify(exercise.commonMistakes),
    exercise.difficulty,
    exercise.muscleGroup,
    JSON.stringify(exercise.secondaryMuscles),
    exercise.equipment,
    exercise.repsBaseline,
    exercise.holdSeconds,
    exercise.caloriesFactor,
    exercise.thumbnailUri,
    exercise.gifUri,
    JSON.stringify(exercise.tags),
    JSON.stringify(exercise.categories),
    exercise.sessionRole,
    exercise.source,
    exercise.youtubeVideoId ?? null,
    exercise.youtubeAttribution ?? null,
  ];
}

export async function countExercises(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercise_library',
  );
  return row?.count ?? 0;
}

export async function getAllExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT * FROM exercise_library ORDER BY name ASC',
  );
  return rows.map(mapExerciseRow);
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExerciseRow>(
    'SELECT * FROM exercise_library WHERE id = ?',
    id,
  );
  return row ? mapExerciseRow(row) : null;
}

export async function insertExercises(exercises: Exercise[]): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      await db.runAsync(
        `INSERT OR REPLACE INTO exercise_library (
          ${INSERT_COLUMNS}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ...insertParams(exercise),
      );
    }
  });
}

export async function replaceExerciseLibrary(exercises: Exercise[]): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    // Update existing rows in place so saved workout plans and sessions keep
    // their foreign-key references while the bundled library changes.
    for (const exercise of exercises) {
      await db.runAsync(
        `UPDATE exercise_library SET
          name = ?,
          description = ?,
          instructions_json = ?,
          common_mistakes_json = ?,
          difficulty = ?,
          muscle_group = ?,
          secondary_muscles_json = ?,
          equipment = ?,
          reps_baseline = ?,
          hold_seconds = ?,
          calories_factor = ?,
          thumbnail_uri = ?,
          gif_uri = ?,
          tags_json = ?,
          categories_json = ?,
          session_role = ?,
          source = ?,
          youtube_video_id = ?,
          youtube_attribution = ?
        WHERE id = ?`,
        ...insertParams(exercise).slice(1),
        exercise.id,
      );

      await db.runAsync(
        `INSERT OR IGNORE INTO exercise_library (
          ${INSERT_COLUMNS}
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ...insertParams(exercise),
      );
    }

    // Remove only obsolete rows that are not referenced by historical plans
    // or sessions. This keeps referential integrity intact across app updates.
    const keepPlaceholders = exercises.map(() => '?').join(', ');
    await db.runAsync(
      `DELETE FROM exercise_library
       WHERE id NOT IN (${keepPlaceholders})
         AND id NOT IN (SELECT exercise_id FROM workout_plan_exercises)
         AND id NOT IN (SELECT exercise_id FROM workout_session_exercises)`,
      ...exercises.map((exercise) => exercise.id),
    );
  });
}
