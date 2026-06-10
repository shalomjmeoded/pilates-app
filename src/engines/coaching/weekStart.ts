import { format, startOfWeek } from 'date-fns';

export function getWeekStartDate(date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
