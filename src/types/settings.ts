import type { MacroTotals } from '@/types/nutrition';
import type { Profile } from '@/types/profile';

export type ReminderType = 'breakfast' | 'lunch' | 'dinner' | 'workout' | 'coaching_tip';

export interface Reminder {
  id: string;
  type: ReminderType;
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface RecalibrationComparison {
  previous: MacroTotals;
  next: MacroTotals;
}

export interface TuneExportPayload {
  version: 1;
  exportedAt: string;
  profile: Profile | null;
  weightLogs: unknown[];
  meals: unknown[];
  workoutSessions: unknown[];
  nutritionTargets: unknown[];
  milestones: unknown[];
  reminders: Reminder[];
}

export const REMINDER_LABELS: Record<ReminderType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  workout: 'Workout',
  coaching_tip: 'Coaching tip',
};

export const REMINDER_MESSAGES: Record<ReminderType, string> = {
  breakfast: 'A gentle nudge to log breakfast.',
  lunch: 'Time to check in with lunch.',
  dinner: 'Log dinner when you are ready.',
  workout: 'Your movement session is waiting.',
  coaching_tip: 'A small coaching reflection for today.',
};
