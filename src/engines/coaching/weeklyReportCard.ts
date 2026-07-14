import type { WeeklyCoachInsightContent } from '@/types/coaching';
import type { WeeklyReportCardData } from '@/components/progress/WeeklyReportCard';

export function buildWeeklyReportCard(input: {
  insight: WeeklyCoachInsightContent | null;
  workoutsCompleted: number;
  workoutsPlanned: number;
  averageCalories?: number;
  calorieTarget?: number;
  bodyFatDelta?: number | null;
  weekLabel?: string;
  targetAdjustmentSummary?: string;
}): WeeklyReportCardData {
  const planned = Math.max(1, input.workoutsPlanned);
  const adherencePercent = Math.round((input.workoutsCompleted / planned) * 100);

  return {
    weekLabel: input.weekLabel ?? 'This week',
    workoutsCompleted: input.workoutsCompleted,
    workoutsPlanned: input.workoutsPlanned,
    adherencePercent: Math.min(100, Math.max(0, adherencePercent)),
    averageCalories: input.averageCalories,
    calorieTarget: input.calorieTarget,
    bodyFatDelta: input.bodyFatDelta ?? null,
    summary:
      input.insight?.summary ??
      'Complete a few sessions and open Weekly AI Coach for your personalized report card.',
    nextWeekFocus:
      input.insight?.focusForNextWeek ??
      'Stay consistent, honor how your body feels, and adjust for any flare-ups.',
    targetAdjustmentSummary:
      input.targetAdjustmentSummary ?? input.insight?.targetAdjustmentSummary,
  };
}
