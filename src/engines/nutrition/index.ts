export { computeNutritionTargets } from './targets';
export { validateMealInput, parseMealNumber } from './validation';
export {
  adjustPortionByStep,
  applyPortionToMeal,
  clampPortion,
  isPortionPreset,
  sumMealTotals,
} from './portion';
export { calculateNutritionScore } from './score';
export { buildNutritionDaySummary, macroProgress } from './summaries';
export { resolveNutritionTargets } from './resolveTargets';
