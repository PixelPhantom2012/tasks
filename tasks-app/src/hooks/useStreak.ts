import { useMemo } from "react";
import { differenceInCalendarDays, parseISO, startOfDay, subDays } from "date-fns";
import type { Task } from "../types";
import { toDateKey } from "../utils/dates";
import { getTasksForDate } from "../utils/recurrence";

/** XP constants — tweak these to balance feel */
export const XP_PER_TASK = 5;       // % per completed task
export const XP_PERFECT_DAY = 10;   // % bonus when ALL tasks in a day are done
export const XP_PER_STAGE = 100;    // % needed to advance one stage
export const MAX_STAGE = 4;         // stages: 1 Seed → 2 Sprout → 3 Bud → 4 Full Bloom

export interface StreakInfo {
  streak: number;
  /** Current visual stage 1–4 */
  stage: number;
  /** Progress toward the next stage, 0–99 */
  growthPct: number;
}

/**
 * Streak eligibility rules:
 * - Future days (after today): never count.
 * - Partial completion counts: at least ONE task completed = day is "done".
 *   Zero completions = day is missed (or pending if within retro window).
 * - Within 2 calendar days before today: retro marks are allowed unconditionally.
 * - 3+ days ago: counts only if the completion timestamp was recorded on that
 *   same calendar day (on-time). Legacy entries without a timestamp = on-time.
 *
 * completedDates across ALL tasks is the source of truth, not the recurrence
 * schedule — a task created today can still be retro-completed on a past date.
 */
function isDayCompleteForStreak(tasks: Task[], date: Date, now: Date): boolean {
  const key = toDateKey(date);

  const todayStart = startOfDay(now);
  const dateStart = startOfDay(date);

  // Future days never count
  if (dateStart > todayStart) return false;

  // Tasks that the user actually completed on this date (via completedDates)
  const completedTasks = tasks.filter((t) => t.completedDates.includes(key));
  if (completedTasks.length === 0) return false;

  const daysBack = differenceInCalendarDays(todayStart, dateStart);

  // Within 2 days: retro allowed unconditionally
  if (daysBack <= 2) return true;

  // Older days: only on-time completions count
  return completedTasks.every((t) => {
    const ts = t.completedTimestamps?.[key];
    if (!ts) return true; // legacy data → treat as on-time
    return toDateKey(parseISO(ts)) === key;
  });
}

/** Pure calculation — exported for testing. React hook wraps this with useMemo. */
export function calcStreak(tasks: Task[], now: Date): StreakInfo {
  const today = now;
  let streak = 0;
  let cursor = subDays(today, 1); // start from yesterday

  // Walk backwards: skip neutral days, count completed days, stop on truly missed days.
  // Days within the 2-day retro window that aren't done yet are "pending" — they
  // don't break the streak (the user can still retroactively complete them).
  const todayStart = startOfDay(today);
  for (let i = 0; i < 365; i++) {
    const cursorKey = toDateKey(cursor);
    const cursorStart = startOfDay(cursor);
    const daysBack = differenceInCalendarDays(todayStart, cursorStart);

    // Tasks scheduled for this day via recurrence / one-off date
    const scheduledTasks = getTasksForDate(tasks, cursor);
    // Tasks the user actually completed on this day (may differ for retro marks)
    const completedOnDay = tasks.filter((t) => t.completedDates.includes(cursorKey));

    if (scheduledTasks.length === 0 && completedOnDay.length === 0) {
      // Completely empty day — neutral, skip
      cursor = subDays(cursor, 1);
      continue;
    }

    const eligible = isDayCompleteForStreak(tasks, cursor, today);

    if (!eligible) {
      // Within retro window and not yet marked: treat as pending, not missed
      if (daysBack <= 2) {
        cursor = subDays(cursor, 1);
        continue;
      }
      break; // Truly missed day — streak ends here
    }

    streak++;
    cursor = subDays(cursor, 1);
  }

  if (isDayCompleteForStreak(tasks, today, today)) streak++;

  // ── XP / stage calculation ──────────────────────────────────────────────
  // Walk every past day (up to today) that has completions and accumulate XP.
  // Each completed task = +XP_PER_TASK. Completing ALL tasks in a day = +XP_PERFECT_DAY bonus.
  // XP overflows into the next stage; capped at MAX_STAGE with 99% shown at the top.
  let totalXp = 0;
  const seenKeys = new Set<string>();

  for (const task of tasks) {
    for (const dateKey of task.completedDates) {
      // Only count past/today completions that are streak-eligible
      const dateObj = new Date(dateKey + "T00:00:00");
      if (startOfDay(dateObj) > startOfDay(now)) continue; // future — skip

      totalXp += XP_PER_TASK;

      if (!seenKeys.has(dateKey)) {
        seenKeys.add(dateKey);
        // Perfect day bonus: all scheduled tasks for that day are done
        const dayTasks = getTasksForDate(tasks, dateObj);
        const allDone =
          dayTasks.length > 0 &&
          dayTasks.every((t) => t.completedDates.includes(dateKey));
        if (allDone) totalXp += XP_PERFECT_DAY;
      }
    }
  }

  const rawStage = Math.floor(totalXp / XP_PER_STAGE) + 1;
  const stage = Math.min(rawStage, MAX_STAGE);
  const growthPct =
    stage >= MAX_STAGE
      ? Math.min(99, totalXp - (MAX_STAGE - 1) * XP_PER_STAGE) // cap at 99 at top stage
      : totalXp % XP_PER_STAGE;

  return { streak, stage, growthPct };
}

export function useStreak(tasks: Task[], now = new Date()): StreakInfo {
  return useMemo(() => calcStreak(tasks, now), [tasks]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Returns how many consecutive days have been missed (not counting today).
 * A day is "missed" when it had tasks but not all were completed.
 */
export function getMissedDays(tasks: Task[], now = new Date()): number {
  const today = now;
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

    const anyDone = dayTasks.some((t) => t.completedDates.includes(key));
    if (anyDone) break; // At least one task done — not missed, stop counting

    missed++;
    cursor = subDays(cursor, 1);
  }
  return missed;
}
