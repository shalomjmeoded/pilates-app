import type { ExerciseFeedback } from '@/types/exercise';

export function isFeedbackComplete(
  required: Array<{ exerciseId: string; sortOrder: number }>,
  feedbackMap: Record<string, ExerciseFeedback | undefined>,
): boolean {
  return required.every((item) => {
    const key = `${item.exerciseId}:${item.sortOrder}`;
    return feedbackMap[key] !== undefined;
  });
}
