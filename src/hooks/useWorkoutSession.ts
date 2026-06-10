import { useCallback, useEffect, useState } from 'react';

import { getExerciseById } from '@/db/repositories/exerciseRepository';
import {
  getSessionById,
  getWorkoutPlanByDate,
} from '@/db/repositories/workoutRepository';
import { getDatabase } from '@/db/connection';
import type { WorkoutPlanExerciseDetail, WorkoutSession } from '@/types/workout';

interface WorkoutSessionState {
  session: WorkoutSession | null;
  planDate: string | null;
  exercises: WorkoutPlanExerciseDetail[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

async function getPlanById(planId: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ plan_date: string }>(
    'SELECT plan_date FROM workout_plans WHERE id = ?',
    planId,
  );
  if (!row) {
    return null;
  }
  return getWorkoutPlanByDate(row.plan_date);
}

export function useWorkoutSession(sessionId: string): WorkoutSessionState {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [planDate, setPlanDate] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutPlanExerciseDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionRow = await getSessionById(sessionId);
      if (!sessionRow) {
        setError('Workout session not found.');
        setSession(null);
        setExercises([]);
        return;
      }

      const plan = await getPlanById(sessionRow.planId);
      if (!plan) {
        setError('Workout plan not found.');
        return;
      }

      const details: WorkoutPlanExerciseDetail[] = [];
      for (const item of plan.exercises) {
        const exercise = await getExerciseById(item.exerciseId);
        if (!exercise) {
          throw new Error(`Missing library exercise: ${item.exerciseId}`);
        }
        details.push({ ...item, exercise });
      }

      setSession(sessionRow);
      setPlanDate(plan.planDate);
      setExercises(details);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load session.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { session, planDate, exercises, isLoading, error, reload };
}
