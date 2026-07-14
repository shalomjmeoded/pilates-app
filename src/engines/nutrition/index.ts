export { computeNutritionTargets } from './targets';
export {
  caloriesFromMacros,
  macrosMatchCalories,
  parseMealNumber,
  roundCaloriesFromMacros,
  validateMealInput,
} from './validation';
export {
  adjustPortionByStep,
  applyPortionToMeal,
  clampPortion,
  isPortionPreset,
  sumMealTotals,
} from './portion';
export { calculateNutritionScore } from './score';
export { reconcileMealEstimate } from './reconcileMealEstimate';
export { buildNutritionDaySummary, macroProgress } from './summaries';
export { resolveNutritionTargets } from './resolveTargets';
