import type { FitnessGoal } from '@/types/profile';
import type { WeeklyCoachInsightContent, WeeklyCoachSummary } from '@/types/coaching';

function goalLabel(goal: FitnessGoal): string {
  return goal.replaceAll('_', ' ');
}

function buildWins(summary: WeeklyCoachSummary): string[] {
  const wins: string[] = [];

  if (summary.workoutsPlanned > 0 && summary.workoutsCompleted >= summary.workoutsPlanned) {
    wins.push(
      `You honored every planned session — ${summary.workoutsCompleted} of ${summary.workoutsPlanned}. That is real commitment.`,
    );
  } else if (summary.workoutsCompleted >= 3) {
    wins.push(`You moved ${summary.workoutsCompleted} times — consistency like that compounds.`);
  }
  if ((summary.proteinAdherencePercent ?? 0) >= 80) {
    wins.push(
      `Protein stayed supportive at about ${Math.round(summary.proteinAdherencePercent ?? 0)}%.`,
    );
  }
  if ((summary.calorieAdherencePercent ?? 0) >= 80) {
    wins.push('Your fuel tracked close to target most days — that is care, not restriction.');
  }
  if (summary.weightTrend === 'down' && summary.goal === 'lose_weight') {
    wins.push('The scale is trending your way — gentle, steady momentum.');
  }
  if (summary.weightTrend === 'up' && summary.goal === 'build_muscle') {
    wins.push('Body weight is rising — fuel for the strength you are building.');
  }
  if (wins.length === 0) {
    wins.push('You showed up and kept tracking — that is where every result starts.');
  }
  return wins.slice(0, 3);
}

/**
 * Data-driven insight used only if the AI coach is unavailable.
 */
export function buildLocalWeeklyCoachFallback(
  summary: WeeklyCoachSummary,
): WeeklyCoachInsightContent {
  const wins = buildWins(summary);

  let nutritionTip =
    'Anchor each meal with a palm of protein — you will feel steadier through the day.';
  if ((summary.proteinAdherencePercent ?? 100) < 70) {
    nutritionTip =
      'Protein dipped this week — try one easy protein anchor tomorrow: eggs, yogurt, tofu, or fish.';
  } else if ((summary.calorieAdherencePercent ?? 100) < 75) {
    nutritionTip =
      'Calories drifted from target — a little prep the night before makes tomorrow kinder.';
  } else if ((summary.calorieAdherencePercent ?? 0) > 115) {
    nutritionTip =
      'You ran a bit over target — small portion tweaks work better than skipping meals.';
  }

  let weightTip =
    'Keep a steady weigh-in rhythm a few mornings a week so the trend stays clear.';
  if ((summary.weightLogDays ?? 0) < 3) {
    weightTip =
      'Weight logs were sparse — aim for 4–5 morning weigh-ins next week so we can coach the trend, not one noisy day.';
  } else if (summary.weightTrend === 'down' && summary.goal === 'lose_weight') {
    weightTip =
      'Your trend is gently down — protect sleep and protein so the drop stays sustainable.';
  } else if (summary.weightTrend === 'up' && summary.goal === 'lose_weight') {
    weightTip =
      'Weight ticked up — check sodium, cycle timing, and weekend calories before changing the plan.';
  } else if (summary.weightTrend === 'stable') {
    weightTip =
      'Weight held steady — that is useful data. Pair it with session consistency before chasing a bigger deficit.';
  }

  let workoutTip =
    'Warm up gently, move with intention, and leave a little energy for tomorrow.';
  if (summary.topSkippedExerciseNames.length > 0) {
    workoutTip = `${summary.topSkippedExerciseNames[0]} keeps getting skipped — swap it for a variation that feels good on your body instead of forcing it.`;
  } else if (summary.workoutsCompleted < 2) {
    workoutTip =
      'Momentum beats intensity right now — book one 20-minute session you know you can finish.';
  } else if (
    summary.workoutsPlanned > 0 &&
    summary.workoutsCompleted < summary.workoutsPlanned
  ) {
    workoutTip = `You finished ${summary.workoutsCompleted} of ${summary.workoutsPlanned} sessions — protect one non‑negotiable slot next week and keep rest days intentional.`;
  }

  let focusForNextWeek = `Choose one kind, repeatable habit that supports your ${goalLabel(summary.goal)} goal.`;
  if (summary.workoutsPlanned > summary.workoutsCompleted) {
    focusForNextWeek = `Invite yourself closer to the plan: ${summary.workoutsCompleted} of ${summary.workoutsPlanned} sessions done — aim to match them next week without pressure.`;
  } else if (summary.weightTrend === 'up' && summary.goal === 'lose_weight') {
    focusForNextWeek =
      'Keep the movement rhythm and gently tighten nutrition consistency — both matter.';
  } else if (summary.weightTrend === 'down' && summary.goal === 'build_muscle') {
    focusForNextWeek =
      'Protect recovery and calories so hard work turns into strength, not burnout.';
  }

  const summaryLine =
    summary.workoutsPlanned > 0
      ? `Last week you finished ${summary.workoutsCompleted} of ${summary.workoutsPlanned} sessions while supporting your ${goalLabel(summary.goal)} goal.`
      : `Last week you logged ${summary.workoutsCompleted} workouts while supporting your ${goalLabel(summary.goal)} goal.`;

  return {
    summary: summaryLine,
    wins,
    focusForNextWeek,
    nutritionTip,
    weightTip,
    workoutTip,
    source: 'local',
    generatedAt: new Date().toISOString(),
  };
}
