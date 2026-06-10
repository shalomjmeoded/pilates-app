import type { AiExerciseSubstitution } from '@/types/ai';
import type { Exercise, Difficulty } from '@/types/exercise';
import type { ExerciseSwapReason } from '@/types/exerciseSwap';

import { findSwapCandidate } from './exerciseSwap';

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export interface ResolvedExerciseSubstitution {
  exercise: Exercise;
  reason: string;
  coachingNote: string;
  source: 'ai' | 'fallback';
}

function shiftDifficulty(difficulty: Difficulty, direction: -1 | 1): Difficulty | null {
  const index = DIFFICULTY_ORDER.indexOf(difficulty);
  const next = index + direction;
  if (next < 0 || next >= DIFFICULTY_ORDER.length) {
    return null;
  }
  return DIFFICULTY_ORDER[next];
}

function filterLibraryForReason(
  library: Exercise[],
  current: Exercise,
  reason: ExerciseSwapReason,
): Exercise[] {
  switch (reason) {
    case 'too_hard': {
      const easier = shiftDifficulty(current.difficulty, -1);
      if (!easier) {
        return library.filter((item) => item.difficulty === 'beginner');
      }
      return library.filter(
        (item) => item.difficulty === easier || item.difficulty === 'beginner',
      );
    }
    case 'too_easy': {
      const harder = shiftDifficulty(current.difficulty, 1);
      if (!harder) {
        return library.filter((item) => item.difficulty === 'advanced');
      }
      return library.filter(
        (item) => item.difficulty === harder || item.difficulty === 'advanced',
      );
    }
    case 'no_equipment':
      return library.filter((item) => item.equipment === 'none' || item.equipment === 'mat');
    case 'knee_discomfort':
      return library.filter((item) => {
        const nameBlob = `${item.name} ${item.description}`.toLowerCase();
        return !nameBlob.includes('jump') && !nameBlob.includes('hop') && !nameBlob.includes('plyo');
      });
    case 'dislike_movement':
    default:
      return library;
  }
}

export function validateLibraryReplacement(
  replacementExerciseId: string,
  library: Exercise[],
  excludedExerciseIds: Set<string>,
  currentExerciseId: string,
): Exercise | null {
  if (!replacementExerciseId || replacementExerciseId === currentExerciseId) {
    return null;
  }
  if (excludedExerciseIds.has(replacementExerciseId)) {
    return null;
  }
  return library.find((item) => item.id === replacementExerciseId) ?? null;
}

export function findDeterministicSwapCandidate(
  current: Exercise,
  library: Exercise[],
  excludedExerciseIds: Set<string>,
  reason: ExerciseSwapReason,
): Exercise | null {
  const filtered = filterLibraryForReason(library, current, reason);
  const pool = filtered.length > 0 ? filtered : library;

  const reasonAware = pool.find((exercise) => {
    if (exercise.id === current.id || excludedExerciseIds.has(exercise.id)) {
      return false;
    }
    return exercise.muscleGroup === current.muscleGroup;
  });

  if (reasonAware) {
    return reasonAware;
  }

  return findSwapCandidate(current, pool, excludedExerciseIds);
}

export function resolveExerciseSubstitution(
  current: Exercise,
  library: Exercise[],
  excludedExerciseIds: Set<string>,
  reason: ExerciseSwapReason,
  aiSuggestion: AiExerciseSubstitution | null,
): ResolvedExerciseSubstitution | null {
  if (aiSuggestion) {
    const validated = validateLibraryReplacement(
      aiSuggestion.replacementExerciseId,
      library,
      excludedExerciseIds,
      current.id,
    );
    if (validated) {
      return {
        exercise: validated,
        reason: aiSuggestion.reason,
        coachingNote: aiSuggestion.coachingNote,
        source: 'ai',
      };
    }
  }

  const fallback = findDeterministicSwapCandidate(
    current,
    library,
    excludedExerciseIds,
    reason,
  );
  if (!fallback) {
    return null;
  }

  return {
    exercise: fallback,
    reason: 'Matched a similar movement from your local library.',
    coachingNote: 'Start with the easier variation and focus on controlled form.',
    source: 'fallback',
  };
}
