import type { Exercise } from '@/types/exercise';

export function buildExerciseYouTubeSearchUrl(exercise: Exercise): string {
  const query = encodeURIComponent(`${exercise.name} exercise tutorial proper form`);
  return `https://www.youtube.com/results?search_query=${query}`;
}
