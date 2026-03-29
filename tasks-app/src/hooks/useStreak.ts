import { useMemo } from "react";
import { subDays } from "date-fns";
import type { Task } from "../types";
import { toDateKey } from "../utils/dates";
import { getTasksForDate } from "../utils/recurrence";

export interface StreakInfo {
  streak: number;
  plantLevel: number; // 0–4
}

/**
 * A day is considered "complete" only when ALL tasks scheduled for that day
 * are marked done. Days with no tasks do not count (streak breaks).
 */
function isDayComplete(tasks: Task[], date: Date): boolean {
  const key = toDateKey(date);
  const dayTasks = getTasksForDate(tasks, date);
  if (dayTasks.length === 0) return false;
  return dayTasks.every((t) => t.completedDates.includes(key));
}

export function useStreak(tasks: Task[]): StreakInfo {
  return useMemo(() => {
    const today = new Date();
    let streak = 0;
    let cursor = subDays(today, 1); // start from yesterday

    // Walk backwards: skip empty days, count completed days, stop on incomplete days
    for (let i = 0; i < 365; i++) {
      const key = toDateKey(cursor);
      const dayTasks = getTasksForDate(tasks, cursor);

      if (dayTasks.length === 0) {
        // No tasks that day — skip it (neutral, doesn't break streak)
        cursor = subDays(cursor, 1);
        continue;
      }

      const allDone = dayTasks.every((t) => t.completedDates.includes(key));
      if (!allDone) break; // Had tasks but didn't finish all → streak ends

      streak++;
      cursor = subDays(cursor, 1);
    }

    // Also count today if ALL of today's tasks are completed
    if (isDayComplete(tasks, today)) streak++;

    const plantLevel = Math.min(4, Math.floor(streak / 2));

    return { streak, plantLevel };
  }, [tasks]);
}

/**
 * Returns how many consecutive days have been missed (not counting today).
 * A day is "missed" when it had tasks but not all were completed.
 */
export function getMissedDays(tasks: Task[]): number {
  const today = new Date();
  let missed = 0;
  let cursor = subDays(today, 1);

  for (let i = 0; i < 365; i++) {
    const key = toDateKey(cursor);
    const dayTasks = getTasksForDate(tasks, cursor);

    if (dayTasks.length === 0) {
      // No tasks that day — skip (doesn't count as missed)
      cursor = subDays(cursor, 1);
      continue;
    }

    const allDone = dayTasks.every((t) => t.completedDates.includes(key));
    if (allDone) break; // Found a completed day — stop counting missed days

    missed++;
    cursor = subDays(cursor, 1);
  }
  return missed;
}
