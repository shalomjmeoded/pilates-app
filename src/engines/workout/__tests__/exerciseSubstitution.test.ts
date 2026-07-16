import {
  findDeterministicSwapCandidate,
  resolveExerciseSubstitution,
  validateLibraryReplacement,
} from '../exerciseSubstitution';
import type { Exercise } from '@/types/exercise';

const base: Exercise = {
  id: 'squat',
  name: 'Squat',
  description: 'Squat',
  instructions: ['Step'],
  commonMistakes: ['Mistake'],
  difficulty: 'intermediate',
  muscleGroup: 'quadriceps',
  secondaryMuscles: [],
  equipment: 'none',
  repsBaseline: 10,
  holdSeconds: null,
  caloriesFactor: 1,
  thumbnailUri: 'assets/exercises/thumbnails/squat.jpg',
  gifUri: 'assets/exercises/gifs/squat.jpg',
  tags: ['core_focus'],
  categories: ['bodyweight'],
  sessionRole: 'main',
  source: 'free_exercise_db',
};

const easier: Exercise = {
  ...base,
  id: 'chair-squat',
  name: 'Chair Squat',
  difficulty: 'beginner',
};

const excluded = new Set(['squat', 'lunge']);

describe('exerciseSubstitution', () => {
  it('rejects hallucinated exercise ids', () => {
    const result = validateLibraryReplacement('not-in-library', [base, easier], excluded, 'squat');
    expect(result).toBeNull();

    const resolved = resolveExerciseSubstitution(
      base,
      [base, easier],
      excluded,
      'too_hard',
      {
        replacementExerciseId: 'not-in-library',
        reason: 'AI pick',
        coachingNote: 'Go slow',
      },
    );

    expect(resolved?.source).toBe('fallback');
    expect(resolved?.exercise.id).toBe('chair-squat');
  });

  it('accepts valid library-only ai replacements', () => {
    const resolved = resolveExerciseSubstitution(
      base,
      [base, easier],
      excluded,
      'too_hard',
      {
        replacementExerciseId: 'chair-squat',
        reason: 'Easier on knees',
        coachingNote: 'Keep chest lifted',
      },
    );

    expect(resolved?.source).toBe('ai');
    expect(resolved?.exercise.id).toBe('chair-squat');
    expect(resolved?.coachingNote).toBe('Keep chest lifted');
  });

  it('uses deterministic fallback when ai suggestion is invalid', () => {
    const resolved = resolveExerciseSubstitution(
      base,
      [base, easier],
      excluded,
      'too_hard',
      {
        replacementExerciseId: 'fake-ai-id',
        reason: 'Bad id',
        coachingNote: 'Nope',
      },
    );

    expect(resolved?.source).toBe('fallback');
    expect(resolved?.exercise.id).toBe('chair-squat');
  });

  it('finds reason-aware deterministic candidates', () => {
    const advanced = {
      ...base,
      id: 'jump-squat',
      name: 'Jump Squat',
      description: 'Jump squat plyo',
      difficulty: 'advanced' as const,
      tags: ['core_focus'] as Exercise['tags'],
    };
    const candidate = findDeterministicSwapCandidate(
      advanced,
      [advanced, easier],
      new Set(['jump-squat']),
      'too_hard',
    );

    expect(candidate?.id).toBe('chair-squat');
  });
});
