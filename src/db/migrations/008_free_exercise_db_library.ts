export const MIGRATION_008 = `
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS exercise_library_v3 (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions_json TEXT NOT NULL DEFAULT '[]',
  common_mistakes_json TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  muscle_group TEXT NOT NULL,
  secondary_muscles_json TEXT NOT NULL DEFAULT '[]',
  equipment TEXT NOT NULL,
  reps_baseline INTEGER,
  hold_seconds INTEGER,
  calories_factor REAL NOT NULL,
  thumbnail_uri TEXT NOT NULL,
  gif_uri TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  categories_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL DEFAULT 'free_exercise_db'
);

INSERT INTO exercise_library_v3 (
  id, name, description, instructions_json, common_mistakes_json,
  difficulty, muscle_group, secondary_muscles_json, equipment,
  reps_baseline, hold_seconds, calories_factor,
  thumbnail_uri, gif_uri, tags_json, categories_json, source
)
SELECT
  id,
  name,
  description,
  COALESCE(instructions_json, '[]'),
  COALESCE(common_mistakes_json, '[]'),
  difficulty,
  muscle_group,
  '[]',
  equipment,
  reps_baseline,
  hold_seconds,
  calories_factor,
  thumbnail_uri,
  gif_uri,
  tags_json,
  '[]',
  'free_exercise_db'
FROM exercise_library
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'exercise_library');

DROP TABLE IF EXISTS exercise_library;

ALTER TABLE exercise_library_v3 RENAME TO exercise_library;

PRAGMA foreign_keys = ON;
`;
