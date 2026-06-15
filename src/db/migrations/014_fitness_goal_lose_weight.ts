export const MIGRATION_014 = `
CREATE TABLE IF NOT EXISTS profile_next (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  gender_identity TEXT NOT NULL CHECK (gender_identity IN (
    'female', 'male', 'non_binary', 'prefer_not_to_say'
  )),
  birth_year INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  current_weight_kg REAL NOT NULL,
  goal_weight_kg REAL NOT NULL,
  training_frequency TEXT NOT NULL,
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN (
    'lose_weight', 'get_toned', 'maintain', 'build_muscle'
  )),
  exercise_preferences TEXT NOT NULL,
  media_preference TEXT NOT NULL CHECK (media_preference IN (
    'video_streaming', 'static_only'
  )),
  nutrition_mode TEXT NOT NULL CHECK (nutrition_mode IN (
    'full_tracking', 'workouts_only'
  )),
  weight_trajectory TEXT NOT NULL,
  pace_kg_per_week REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO profile_next (
  id,
  gender_identity,
  birth_year,
  height_cm,
  current_weight_kg,
  goal_weight_kg,
  training_frequency,
  fitness_goal,
  exercise_preferences,
  media_preference,
  nutrition_mode,
  weight_trajectory,
  pace_kg_per_week,
  created_at,
  updated_at
)
SELECT
  id,
  gender_identity,
  birth_year,
  height_cm,
  current_weight_kg,
  goal_weight_kg,
  training_frequency,
  fitness_goal,
  exercise_preferences,
  media_preference,
  nutrition_mode,
  weight_trajectory,
  pace_kg_per_week,
  created_at,
  updated_at
FROM profile;

DROP TABLE profile;

ALTER TABLE profile_next RENAME TO profile;
`;
