import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  format,
  eachDayOfInterval,
  isSameWeek,
} from "date-fns";

export const WEEK_START: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0; // Sunday

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_START });
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: WEEK_START });
}

export function getWeekDays(weekStart: Date): Date[] {
  return eachDayOfInterval({ start: weekStart, end: getWeekEnd(weekStart) });
}

export function shiftWeek(weekStart: Date, delta: number): Date {
  return addWeeks(weekStart, delta);
}

export function isCurrentWeek(weekStart: Date): boolean {
  return isSameWeek(weekStart, new Date(), { weekStartsOn: WEEK_START });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);
  const startStr = format(weekStart, "d/M");
  const endStr = format(weekEnd, "d/M/yyyy");
  return `${startStr} – ${endStr}`;
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export const DAY_NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
