import type { Exercise, ExerciseMuscleGroup } from '@/types/exercise';

import {
  applyFeedbackProgression,
  getDeprioritizedExerciseIds,
  swapSkippedExercises,
} from '../progression';

const mockExercise = (id: string, muscleGroup: ExerciseMuscleGroup): Exercise => ({
  id,
  name: id,
  description: 'desc',
  instructions: ['Step one'],
  commonMistakes: ['Mistake one'],
  difficulty: 'intermediate',
  muscleGroup,
  secondaryMuscles: [],
  equipment: 'mat',
  repsBaseline: 10,
  holdSeconds: null,
  caloriesFactor: 0.05,
  thumbnailUri: `assets/exercises/thumbnails/${id}.jpg`,
  gifUri: `assets/exercises/gifs/${id}.jpg`,
  tags: ['mat_pilates'],
  categories: ['bodyweight', 'core'],
  sessionRole: 'main',
  source: 'free_exercise_db',
});

describe('getDeprioritizedExerciseIds', () => {
  it('deprioritizes exercises skipped at least twice', () => {
    const ids = getDeprioritizedExerciseIds({ ex_001: 2, ex_002: 1 });
    expect(ids.has('ex_001')).toBe(true);
    expect(ids.has('ex_002')).toBe(false);
  });
});

describe('applyFeedbackProgression', () => {
  it('increments reps after completed feedback', () => {
    const result = applyFeedbackProgression(
      [{ exerciseId: 'ex_001', sortOrder: 1, sets: 3, reps: 10, holdSeconds: null }],
      [{ exerciseId: 'ex_001', sortOrder: 1, feedback: 'completed' }],
    );
    expect(result[0].reps).toBe(11);
  });

  it('reduces reps after modified feedback', () => {
    const result = applyFeedbackProgression(
      [{ exerciseId: 'ex_001', sortOrder: 1, sets: 3, reps: 10, holdSeconds: null }],
      [{ exerciseId: 'ex_001', sortOrder: 1, feedback: 'modified' }],
    );
    expect(result[0].reps).toBe(9);
  });
});

describe('swapSkippedExercises', () => {
  it('swaps frequently skipped exercise for same muscle group', () => {
    const library = new Map<string, Exercise>([
      ['ex_001', mockExercise('ex_001', 'core')],
      ['ex_002', mockExercise('ex_002', 'core')],
    ]);

    const result = swapSkippedExercises(
      [{ exerciseId: 'ex_001', sortOrder: 1, sets: 3, reps: 10, holdSeconds: null }],
      [{ exerciseId: 'ex_001', sortOrder: 1, feedback: 'skipped' }],
      {
        libraryById: library,
        skippedFrequentIds: new Set(['ex_001']),
        lastSessionFeedback: [{ exerciseId: 'ex_001', sortOrder: 1, feedback: 'skipped' }],
      },
    );

    expect(result[0].exerciseId).toBe('ex_002');
  });
});
