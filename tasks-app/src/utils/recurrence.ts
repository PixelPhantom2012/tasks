import { getDay, differenceInCalendarDays } from "date-fns";
import type { Task } from "../types";
import { toDateKey } from "./dates";

/**
 * Parse a "yyyy-MM-dd" string as a LOCAL date (midnight local time).
 * Using new Date("yyyy-MM-dd") would give UTC midnight, shifted in timezones.
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns true if a task should appear on the given date.
 */
export function taskOccursOnDate(task: Task, date: Date): boolean {
  const dateKey = toDateKey(date);

  if (!task.recurrence) {
    return task.date === dateKey;
  }

  const { recurrence } = task;
  // createdAt is stored as "yyyy-MM-dd" (local date)
  const createdAt = parseLocalDate(task.createdAt);

  // Normalize date to local midnight for accurate day comparison
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (localDate < createdAt) return false;

  switch (recurrence.type) {
    case "daily":
      return true;

    case "weekly": {
      return getDay(localDate) === getDay(createdAt);
    }

    case "interval": {
      const interval = recurrence.intervalDays ?? 1;
      const diff = differenceInCalendarDays(localDate, createdAt);
      return diff % interval === 0;
    }

    case "days-of-week": {
      const days = recurrence.daysOfWeek ?? [];
      return days.includes(getDay(localDate));
    }

    default:
      return false;
  }
}

/**
 * Returns all tasks that occur on a specific date, excluding deleted occurrences.
 */
export function getTasksForDate(tasks: Task[], date: Date): Task[] {
  const dateKey = toDateKey(date);
  return tasks.filter(
    (task) =>
      taskOccursOnDate(task, date) &&
      !(task.deletedDates ?? []).includes(dateKey)
  );
}
