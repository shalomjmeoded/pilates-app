import type { Exercise, ExerciseRow } from '@/types/exercise';
import type { Profile, ProfileRow } from '@/types/profile';
import type { NutritionTargets } from '@/types/nutrition';
import { deriveSubscriptionStatus } from '@/engines/monetization/premiumAccess';
import type { PremiumStatus } from '@/types/premium';

export function mapExerciseRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    instructions: JSON.parse(row.instructions_json),
    commonMistakes: JSON.parse(row.common_mistakes_json),
    difficulty: row.difficulty,
    muscleGroup: row.muscle_group,
    secondaryMuscles: JSON.parse(row.secondary_muscles_json),
    equipment: row.equipment,
    repsBaseline: row.reps_baseline,
    holdSeconds: row.hold_seconds,
    caloriesFactor: row.calories_factor,
    thumbnailUri: row.thumbnail_uri,
    gifUri: row.gif_uri,
    tags: JSON.parse(row.tags_json),
    categories: JSON.parse(row.categories_json),
    sessionRole: row.session_role ?? 'main',
    source: row.source,
  };
}

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    genderIdentity: row.gender_identity,
    birthYear: row.birth_year,
    heightCm: row.height_cm,
    currentWeightKg: row.current_weight_kg,
    goalWeightKg: row.goal_weight_kg,
    trainingFrequency: row.training_frequency,
    fitnessGoal: row.fitness_goal,
    exercisePreferences: JSON.parse(row.exercise_preferences),
    mediaPreference: row.media_preference,
    nutritionMode: 'full_tracking',
    weightTrajectory: row.weight_trajectory,
    paceKgPerWeek: row.pace_kg_per_week as Profile['paceKgPerWeek'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function profileToRow(profile: Profile): Omit<ProfileRow, 'created_at' | 'updated_at'> {
  return {
    id: 1,
    gender_identity: profile.genderIdentity,
    birth_year: profile.birthYear,
    height_cm: profile.heightCm,
    current_weight_kg: profile.currentWeightKg,
    goal_weight_kg: profile.goalWeightKg,
    training_frequency: profile.trainingFrequency,
    fitness_goal: profile.fitnessGoal,
    exercise_preferences: JSON.stringify(profile.exercisePreferences),
    media_preference: profile.mediaPreference,
    nutrition_mode: 'full_tracking',
    weight_trajectory: profile.weightTrajectory,
    pace_kg_per_week: profile.paceKgPerWeek,
  };
}

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

export function mapNutritionTargetRow(row: NutritionTargetRow): NutritionTargets {
  return {
    id: row.id,
    effectiveDate: row.effective_date,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
    isManualOverride: row.is_manual_override === 1,
    createdAt: row.created_at,
  };
}

interface PremiumStatusRow {
  is_premium: number;
  product_id: string | null;
  expires_at: string | null;
  trial_used: number;
  source: 'mock' | 'revenuecat';
}

export function mapPremiumStatusRow(row: PremiumStatusRow): PremiumStatus {
  const isPremium = row.is_premium === 1;
  const productId = row.product_id ?? undefined;
  const expiresAt = row.expires_at ?? undefined;
  const trialUsed = row.trial_used === 1;

  const subscriptionStatus = deriveSubscriptionStatus({
    isPremium,
    productId,
    expiresAt,
    trialUsed,
  });

  return {
    subscriptionStatus,
    isPremium: subscriptionStatus !== 'inactive',
    productId,
    expiresAt,
    trialUsed,
    source: row.source,
  };
}
