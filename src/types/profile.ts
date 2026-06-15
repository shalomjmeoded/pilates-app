export type GenderIdentity = 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';

export type TrainingFrequency = 'none' | '1_2' | '3_4' | '5_plus';

export type FitnessGoal = 'lose_weight' | 'get_toned' | 'maintain' | 'build_muscle';

export type MediaPreference = 'video_streaming' | 'static_only';

export type NutritionMode = 'full_tracking';

export type StoredNutritionMode = NutritionMode | 'workouts_only';

export type WeightTrajectory = 'weight_loss' | 'lean_mass' | 'steady_state';

export type Pace = 0.25 | 0.5 | 1;

export type ExercisePreference =
  | 'mat_pilates'
  | 'reformer_pilates'
  | 'cardio_burn'
  | 'core_focus'
  | 'flexibility_length';

export interface Profile {
  genderIdentity: GenderIdentity;
  birthYear: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  trainingFrequency: TrainingFrequency;
  fitnessGoal: FitnessGoal;
  exercisePreferences: ExercisePreference[];
  mediaPreference: MediaPreference;
  nutritionMode: NutritionMode;
  weightTrajectory: WeightTrajectory;
  paceKgPerWeek: Pace;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileRow {
  id: number;
  gender_identity: GenderIdentity;
  birth_year: number;
  height_cm: number;
  current_weight_kg: number;
  goal_weight_kg: number;
  training_frequency: TrainingFrequency;
  fitness_goal: FitnessGoal;
  exercise_preferences: string;
  media_preference: MediaPreference;
  nutrition_mode: StoredNutritionMode;
  weight_trajectory: WeightTrajectory;
  pace_kg_per_week: number;
  created_at: string;
  updated_at: string;
}
