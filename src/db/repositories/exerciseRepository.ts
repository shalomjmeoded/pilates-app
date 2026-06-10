import { getDatabase } from '@/db/connection';
import { mapExerciseRow } from '@/db/mappers';
import type { Exercise, ExerciseRow } from '@/types/exercise';

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
          id, name, description, instructions_json, common_mistakes_json,
          difficulty, muscle_group, secondary_muscles_json, equipment,
          reps_baseline, hold_seconds, calories_factor,
          thumbnail_uri, gif_uri, tags_json, categories_json, session_role, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      );
    }
  });
}

export async function replaceExerciseLibrary(exercises: Exercise[]): Promise<void> {
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.execAsync('PRAGMA foreign_keys = OFF');
    await db.runAsync('DELETE FROM exercise_library');
    await db.execAsync('PRAGMA foreign_keys = ON');

    for (const exercise of exercises) {
      await db.runAsync(
        `INSERT INTO exercise_library (
          id, name, description, instructions_json, common_mistakes_json,
          difficulty, muscle_group, secondary_muscles_json, equipment,
          reps_baseline, hold_seconds, calories_factor,
          thumbnail_uri, gif_uri, tags_json, categories_json, session_role, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      );
    }
  });
}
