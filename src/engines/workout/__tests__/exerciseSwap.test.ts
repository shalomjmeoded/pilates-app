import { findSwapCandidate } from '../exerciseSwap';
import type { Exercise } from '@/types/exercise';

const base: Exercise = {
  id: 'a',
  name: 'A',
  description: 'A',
  instructions: ['Step one'],
  commonMistakes: ['Mistake one'],
  difficulty: 'beginner',
  muscleGroup: 'core',
  secondaryMuscles: [],
  equipment: 'none',
  repsBaseline: 10,
  holdSeconds: null,
  caloriesFactor: 1,
  thumbnailUri: 'assets/exercises/thumbnails/a.jpg',
  gifUri: 'assets/exercises/gifs/a.jpg',
  tags: ['core_focus'],
  categories: ['core', 'bodyweight'],
  sessionRole: 'main',
  source: 'free_exercise_db',
};

const replacement: Exercise = {
  ...base,
  id: 'b',
  name: 'B',
};

const wrongGroup: Exercise = {
  ...base,
  id: 'c',
  muscleGroup: 'glutes',
};

describe('findSwapCandidate', () => {
  it('finds matching replacement', () => {
    const result = findSwapCandidate(base, [base, replacement, wrongGroup], new Set(['a']));
    expect(result?.id).toBe('b');
  });

  it('returns null when no candidate exists', () => {
    const result = findSwapCandidate(base, [base, wrongGroup], new Set(['a']));
    expect(result).toBeNull();
  });
});
