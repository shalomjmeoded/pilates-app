export { buildAdherenceMetrics } from './adherence';
export { buildBmiInfo, getBmiCategory } from './bmiCategory';
export { buildChartLayout, CHART_DIMENSIONS } from './chartData';
export { calculateConsistencyScore } from './consistencyScore';
export { buildGoalProjection, filterLogsByRange } from './goalProjection';
export { evaluateMilestones, buildMilestoneStatuses, MILESTONE_DEFINITIONS } from './milestones';
export {
  isDuplicateTimestamp,
  parseWeightInput,
  validateWeightKg,
  MIN_WEIGHT_KG,
  MAX_WEIGHT_KG,
} from './weightValidation';
export { buildWeightJourney } from './weightJourney';
export { calculateWeightStreakStats } from './weightStreaks';
export { buildWeightTrendAverages } from './weightTrends';
