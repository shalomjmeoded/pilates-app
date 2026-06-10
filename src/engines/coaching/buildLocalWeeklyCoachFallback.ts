import type { WeeklyCoachInsightContent, WeeklyCoachSummary } from '@/types/coaching';

export function buildLocalWeeklyCoachFallback(
  summary: WeeklyCoachSummary,
): WeeklyCoachInsightContent {
  const wins: string[] = [];

  if (summary.workoutsCompleted >= 3) {
    wins.push(`Completed ${summary.workoutsCompleted} workouts this week.`);
  }
  if ((summary.proteinAdherencePercent ?? 0) >= 80) {
    wins.push('Protein adherence stayed strong.');
  }
  if ((summary.calorieAdherencePercent ?? 0) >= 80) {
    wins.push('Calorie targets were mostly on track.');
  }
  if (wins.length === 0) {
    wins.push('You showed up and kept tracking — that counts.');
  }

  let nutritionTip = 'Aim for steady meals with protein at breakfast and lunch.';
  if ((summary.proteinAdherencePercent ?? 100) < 70) {
    nutritionTip = 'Add a protein anchor to one meal tomorrow — yogurt, eggs, tofu, or fish.';
  } else if ((summary.calorieAdherencePercent ?? 100) < 75) {
    nutritionTip = 'If energy feels low, add a balanced snack before your workout.';
  }

  let workoutTip = 'Keep sessions short and consistent — form over speed.';
  if (summary.skippedExerciseCount > 0) {
    workoutTip = 'Swap movements that feel uncomfortable before skipping entire sessions.';
  } else if (summary.workoutsCompleted < 2) {
    workoutTip = 'Schedule one short session you can finish in under 20 minutes.';
  }

  let focusForNextWeek = 'Build one repeatable habit you can hit four days in a row.';
  if (summary.weightTrend === 'up' && summary.goal === 'get_toned') {
    focusForNextWeek = 'Pair movement consistency with protein-forward meals.';
  } else if (summary.weightTrend === 'down' && summary.goal === 'build_muscle') {
    focusForNextWeek = 'Protect recovery and protein while keeping workouts challenging.';
  }

  return {
    summary: `This week: ${summary.workoutsCompleted} workouts completed, goal is ${summary.goal.replaceAll('_', ' ')}.`,
    wins,
    focusForNextWeek,
    nutritionTip,
    workoutTip,
    source: 'local',
    generatedAt: new Date().toISOString(),
  };
}
