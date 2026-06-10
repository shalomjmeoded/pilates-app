export interface NutritionTargets {
  id?: string;
  effectiveDate: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  isManualOverride: boolean;
  createdAt?: string;
}

export type MealSource = 'manual' | 'ai_text' | 'ai_photo';

export interface MealIngredientEstimate {
  name: string;
  grams: number;
}

export interface Meal {
  id: string;
  mealDate: string;
  loggedAt: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  portionMultiplier: number;
  source: MealSource;
  aiConfidence?: number;
  aiIngredients?: MealIngredientEstimate[];
}

export interface MealInput {
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  source: MealSource;
  mealDate: string;
  aiConfidence?: number;
  aiIngredients?: MealIngredientEstimate[];
}

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface NutritionDaySummary {
  mealDate: string;
  targets: NutritionTargets;
  consumed: MacroTotals;
  remainingCalories: number;
  nutritionScore: number;
  mealCount: number;
}

export interface NutritionDailyTotalsRow {
  mealDate: string;
  caloriesConsumed: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  mealCount: number;
  nutritionScore: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  updatedAt: string;
}

export type MealPreset = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export const MEAL_PRESETS: MealPreset[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export const PORTION_PRESETS = [0.5, 1, 1.5, 2] as const;

export type PortionPreset = (typeof PORTION_PRESETS)[number];

export interface SavedMeal {
  id: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  createdAt: string;
}

export interface SavedMealInput {
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MealUpdateInput {
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  loggedAt: string;
}
