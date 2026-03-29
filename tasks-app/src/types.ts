export type RecurrenceType = "daily" | "weekly" | "interval" | "days-of-week";

export interface Recurrence {
  type: RecurrenceType;
  intervalDays?: number;    // for "interval" type
  daysOfWeek?: number[];    // 0=Sun … 6=Sat
}

export interface Task {
  id: string;
  title: string;
  note?: string;
  time?: string;           // "HH:mm"
  date?: string;           // "yyyy-MM-dd" — for one-off tasks
  recurrence?: Recurrence;
  completedDates: string[]; // ["yyyy-MM-dd", ...]
  deletedDates: string[];   // occurrences skipped for recurring tasks
  createdAt: string;        // "yyyy-MM-dd" local date
}
