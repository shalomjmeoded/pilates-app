import type { Exercise } from '@/types/exercise';

const CURATED_REFERENCE_VIDEO_URLS: Partial<Record<Exercise['id'], string>> = {
  Cat_Cow: 'https://www.youtube.com/watch?v=FLQDiUccsko',
};

export function buildExerciseYouTubeSearchUrl(exercise: Exercise): string {
  const curatedUrl = CURATED_REFERENCE_VIDEO_URLS[exercise.id];
  if (curatedUrl) {
    return curatedUrl;
  }

  const query = encodeURIComponent(`${exercise.name} exercise tutorial proper form`);
  return `https://www.youtube.com/results?search_query=${query}`;
}
