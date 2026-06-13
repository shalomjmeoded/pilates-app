import { createId } from '@/utils/createId';

import { getDatabase } from '@/db/connection';
import type { ExerciseFeedback } from '@/types/exercise';
import type {
  WorkoutChangeFeedback,
  WorkoutChangeRequest,
  WorkoutPlan,
  WorkoutPlanExercise,
  WorkoutSession,
  WorkoutSessionExerciseFeedback,
} from '@/types/workout';

interface WorkoutPlanRow {
  id: string;
  plan_date: string;
  generated_at: string;
  source: WorkoutPlan['source'];
}

interface WorkoutPlanExerciseRow {
  id: string;
  plan_id: string;
  exercise_id: string;
  sort_order: number;
  sets: number;
  reps: number | null;
  hold_seconds: number | null;
  notes: string | null;
}

interface WorkoutSessionRow {
  id: string;
  plan_id: string;
  started_at: string;
  ended_at: string | null;
  status: WorkoutSession['status'];
  current_exercise_index?: number;
  elapsed_seconds?: number;
}

interface SessionExerciseRow {
  exercise_id: string;
  sort_order: number;
  feedback: ExerciseFeedback | null;
  completed_at: string | null;
}

interface WorkoutChangeFeedbackRow {
  id: string;
  week_start: string;
  source_date: string;
  focus_area: WorkoutChangeFeedback['focusArea'];
  target_minutes: number;
  intensity: WorkoutChangeFeedback['intensity'];
  coach_note: string | null;
  created_at: string;
  updated_at: string;
}

export async function saveWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO workout_plans (id, plan_date, generated_at, source)
     VALUES (?, ?, ?, ?)`,
    plan.id,
    plan.planDate,
    plan.generatedAt,
    plan.source,
  );

  await db.runAsync('DELETE FROM workout_plan_exercises WHERE plan_id = ?', plan.id);

  for (const exercise of plan.exercises) {
    await db.runAsync(
      `INSERT INTO workout_plan_exercises (
        id, plan_id, exercise_id, sort_order, sets, reps, hold_seconds, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      createId(),
      plan.id,
      exercise.exerciseId,
      exercise.sortOrder,
      exercise.sets,
      exercise.reps,
      exercise.holdSeconds,
      exercise.notes ?? null,
    );
  }
}

export async function deleteWorkoutPlanByDate(planDate: string): Promise<void> {
  const plan = await getWorkoutPlanByDate(planDate);
  if (!plan) {
    return;
  }

  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const sessions = await db.getAllAsync<{ id: string }>(
      'SELECT id FROM workout_sessions WHERE plan_id = ?',
      plan.id,
    );

    for (const session of sessions) {
      await db.runAsync('DELETE FROM workout_session_exercises WHERE session_id = ?', session.id);
      await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', session.id);
    }

    await db.runAsync('DELETE FROM workout_plan_exercises WHERE plan_id = ?', plan.id);
    await db.runAsync('DELETE FROM workout_plans WHERE id = ?', plan.id);
  });
}

export async function getWorkoutPlanByDate(planDate: string): Promise<WorkoutPlan | null> {
  const db = await getDatabase();
  const planRow = await db.getFirstAsync<WorkoutPlanRow>(
    'SELECT * FROM workout_plans WHERE plan_date = ?',
    planDate,
  );

  if (!planRow) {
    return null;
  }

  return mapPlanRow(planRow);
}

async function mapPlanRow(planRow: WorkoutPlanRow): Promise<WorkoutPlan> {
  const db = await getDatabase();
  const exerciseRows = await db.getAllAsync<WorkoutPlanExerciseRow>(
    'SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY sort_order ASC',
    planRow.id,
  );

  const exercises: WorkoutPlanExercise[] = exerciseRows.map((row) => ({
    exerciseId: row.exercise_id,
    sortOrder: row.sort_order,
    sets: row.sets,
    reps: row.reps,
    holdSeconds: row.hold_seconds,
    notes: row.notes ?? undefined,
  }));

  return {
    id: planRow.id,
    planDate: planRow.plan_date,
    generatedAt: planRow.generated_at,
    source: planRow.source,
    exercises,
  };
}

export async function getSessionForPlan(planId: string): Promise<WorkoutSession | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutSessionRow>(
    `SELECT * FROM workout_sessions
     WHERE plan_id = ?
     ORDER BY started_at DESC
     LIMIT 1`,
    planId,
  );

  return row ? mapSessionRow(row) : null;
}

export async function getSessionById(sessionId: string): Promise<WorkoutSession | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutSessionRow>(
    'SELECT * FROM workout_sessions WHERE id = ?',
    sessionId,
  );
  return row ? mapSessionRow(row) : null;
}

function mapSessionRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    planId: row.plan_id,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    status: row.status,
    currentExerciseIndex: row.current_exercise_index ?? 0,
    elapsedSeconds: row.elapsed_seconds ?? 0,
  };
}

export async function startWorkoutSession(planId: string): Promise<WorkoutSession> {
  const db = await getDatabase();
  const existing = await getSessionForPlan(planId);

  if (existing?.status === 'in_progress') {
    return existing;
  }

  if (existing?.status === 'completed') {
    return existing;
  }

  const session: WorkoutSession = {
    id: createId(),
    planId,
    startedAt: new Date().toISOString(),
    status: 'in_progress',
  };

  await db.runAsync(
    `INSERT INTO workout_sessions (id, plan_id, started_at, status)
     VALUES (?, ?, ?, ?)`,
    session.id,
    session.planId,
    session.startedAt,
    session.status,
  );

  const plan = await db.getFirstAsync<WorkoutPlanRow>(
    'SELECT * FROM workout_plans WHERE id = ?',
    planId,
  );

  if (plan) {
    const exercises = await db.getAllAsync<WorkoutPlanExerciseRow>(
      'SELECT * FROM workout_plan_exercises WHERE plan_id = ? ORDER BY sort_order ASC',
      planId,
    );

    for (const exercise of exercises) {
      await db.runAsync(
        `INSERT INTO workout_session_exercises (
          id, session_id, exercise_id, sort_order
        ) VALUES (?, ?, ?, ?)`,
        createId(),
        session.id,
        exercise.exercise_id,
        exercise.sort_order,
      );
    }
  }

  return session;
}

export async function getSessionFeedback(
  sessionId: string,
): Promise<WorkoutSessionExerciseFeedback[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SessionExerciseRow>(
    `SELECT exercise_id, sort_order, feedback, completed_at
     FROM workout_session_exercises
     WHERE session_id = ?
     ORDER BY sort_order ASC`,
    sessionId,
  );

  return rows
    .filter((row): row is SessionExerciseRow & { feedback: ExerciseFeedback } => row.feedback !== null)
    .map((row) => ({
      exerciseId: row.exercise_id,
      sortOrder: row.sort_order,
      feedback: row.feedback,
      completedAt: row.completed_at ?? undefined,
    }));
}

export async function getSessionExercisesPendingFeedback(sessionId: string): Promise<
  Array<{ exerciseId: string; sortOrder: number }>
> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ exercise_id: string; sort_order: number }>(
    `SELECT exercise_id, sort_order
     FROM workout_session_exercises
     WHERE session_id = ?
     ORDER BY sort_order ASC`,
    sessionId,
  );

  return rows.map((row) => ({
    exerciseId: row.exercise_id,
    sortOrder: row.sort_order,
  }));
}

export async function saveSessionFeedback(
  sessionId: string,
  feedbackItems: WorkoutSessionExerciseFeedback[],
): Promise<void> {
  const db = await getDatabase();

  for (const item of feedbackItems) {
    await db.runAsync(
      `UPDATE workout_session_exercises
       SET feedback = ?, completed_at = ?
       WHERE session_id = ? AND exercise_id = ? AND sort_order = ?`,
      item.feedback,
      item.completedAt ?? new Date().toISOString(),
      sessionId,
      item.exerciseId,
      item.sortOrder,
    );
  }
}

export async function completeWorkoutSession(sessionId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE workout_sessions
     SET status = 'completed', ended_at = datetime('now')
     WHERE id = ?`,
    sessionId,
  );
}

export async function updateSessionProgress(
  sessionId: string,
  currentExerciseIndex: number,
  elapsedSeconds: number,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE workout_sessions
     SET current_exercise_index = ?, elapsed_seconds = ?
     WHERE id = ?`,
    currentExerciseIndex,
    elapsedSeconds,
    sessionId,
  );
}

export async function discardWorkoutSession(sessionId: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM workout_session_exercises WHERE session_id = ?', sessionId);
    await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', sessionId);
  });
}

export async function getCompletedWorkoutDatesBetween(
  startDate: string,
  endDate: string,
): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ plan_date: string }>(
    `SELECT DISTINCT wp.plan_date
     FROM workout_sessions ws
     INNER JOIN workout_plans wp ON wp.id = ws.plan_id
     WHERE ws.status = 'completed'
       AND wp.plan_date >= ?
       AND wp.plan_date <= ?
     ORDER BY wp.plan_date ASC`,
    startDate,
    endDate,
  );
  return rows.map((row) => row.plan_date);
}

export async function getPlannedWorkoutDatesBetween(
  startDate: string,
  endDate: string,
): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ plan_date: string }>(
    `SELECT DISTINCT plan_date
     FROM workout_plans
     WHERE plan_date >= ? AND plan_date <= ?
     ORDER BY plan_date ASC`,
    startDate,
    endDate,
  );
  return rows.map((row) => row.plan_date);
}

export async function swapPlanExercise(
  planId: string,
  sortOrder: number,
  newExerciseId: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE workout_plan_exercises
     SET exercise_id = ?
     WHERE plan_id = ? AND sort_order = ?`,
    newExerciseId,
    planId,
    sortOrder,
  );

  const session = await getSessionForPlan(planId);
  if (session?.status === 'in_progress') {
    await db.runAsync(
      `UPDATE workout_session_exercises
       SET exercise_id = ?
       WHERE session_id = ? AND sort_order = ?`,
      newExerciseId,
      session.id,
      sortOrder,
    );
  }
}

export async function countCompletedWorkouts(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM workout_sessions WHERE status = 'completed'`,
  );
  return row?.count ?? 0;
}

export async function countCompletedWorkoutsInLastDays(days: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM workout_sessions
     WHERE status = 'completed'
       AND ended_at >= datetime('now', ?)`,
    `-${days} days`,
  );
  return row?.count ?? 0;
}

export async function countPlannedWorkoutDaysInLastDays(days: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT plan_date) as count
     FROM workout_plans
     WHERE plan_date >= date('now', ?)`,
    `-${days} days`,
  );
  return row?.count ?? 0;
}

export async function getRecentSkipCounts(withinDays: number): Promise<Record<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ exercise_id: string; count: number }>(
    `SELECT wse.exercise_id, COUNT(*) as count
     FROM workout_session_exercises wse
     INNER JOIN workout_sessions ws ON ws.id = wse.session_id
     WHERE wse.feedback = 'skipped'
       AND ws.status = 'completed'
       AND ws.ended_at >= datetime('now', ?)
     GROUP BY wse.exercise_id`,
    `-${withinDays} days`,
  );

  return Object.fromEntries(rows.map((row) => [row.exercise_id, row.count]));
}

export async function getLatestCompletedSessionFeedback(
  beforeDate: string,
): Promise<WorkoutSessionExerciseFeedback[]> {
  const db = await getDatabase();
  const session = await db.getFirstAsync<{ id: string }>(
    `SELECT ws.id
     FROM workout_sessions ws
     INNER JOIN workout_plans wp ON wp.id = ws.plan_id
     WHERE ws.status = 'completed' AND wp.plan_date < ?
     ORDER BY wp.plan_date DESC, ws.ended_at DESC
     LIMIT 1`,
    beforeDate,
  );

  if (!session) {
    return [];
  }

  return getSessionFeedback(session.id);
}

function mapWorkoutChangeFeedbackRow(row: WorkoutChangeFeedbackRow): WorkoutChangeFeedback {
  return {
    weekStart: row.week_start,
    sourceDate: row.source_date,
    focusArea: row.focus_area,
    targetMinutes: row.target_minutes,
    intensity: row.intensity,
    coachNote: row.coach_note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getWorkoutChangeFeedbackForWeek(
  weekStart: string,
): Promise<WorkoutChangeFeedback | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<WorkoutChangeFeedbackRow>(
    'SELECT * FROM workout_change_feedback WHERE week_start = ?',
    weekStart,
  );

  return row ? mapWorkoutChangeFeedbackRow(row) : null;
}

export async function getLatestWorkoutChangeFeedback(
  beforeWeekStart?: string,
): Promise<WorkoutChangeFeedback | null> {
  const db = await getDatabase();
  const row = beforeWeekStart
    ? await db.getFirstAsync<WorkoutChangeFeedbackRow>(
        `SELECT * FROM workout_change_feedback
         WHERE week_start < ?
         ORDER BY week_start DESC
         LIMIT 1`,
        beforeWeekStart,
      )
    : await db.getFirstAsync<WorkoutChangeFeedbackRow>(
        `SELECT * FROM workout_change_feedback
         ORDER BY week_start DESC
         LIMIT 1`,
      );

  return row ? mapWorkoutChangeFeedbackRow(row) : null;
}

export async function upsertWorkoutChangeFeedback(
  weekStart: string,
  sourceDate: string,
  request: WorkoutChangeRequest,
): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM workout_change_feedback WHERE week_start = ?',
    weekStart,
  );

  if (existing) {
    await db.runAsync(
      `UPDATE workout_change_feedback
       SET source_date = ?,
           focus_area = ?,
           target_minutes = ?,
           intensity = ?,
           coach_note = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      sourceDate,
      request.focusArea,
      request.targetMinutes,
      request.intensity,
      request.coachNote ?? null,
      existing.id,
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO workout_change_feedback (
      id, week_start, source_date, focus_area, target_minutes, intensity, coach_note
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    createId(),
    weekStart,
    sourceDate,
    request.focusArea,
    request.targetMinutes,
    request.intensity,
    request.coachNote ?? null,
  );
}

export async function countWorkoutChangeEventsForDate(eventDate: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM workout_change_events
     WHERE event_date = ?`,
    eventDate,
  );
  return row?.count ?? 0;
}

export async function logWorkoutChangeEvent(
  eventDate: string,
  planDate: string,
  request: WorkoutChangeRequest,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO workout_change_events (
      id, event_date, plan_date, focus_area, target_minutes, intensity
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    createId(),
    eventDate,
    planDate,
    request.focusArea,
    request.targetMinutes,
    request.intensity,
  );
}
