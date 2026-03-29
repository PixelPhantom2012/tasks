import { useState, useCallback } from "react";
import type { Task, Recurrence } from "../types";
import { toDateKey } from "../utils/dates";

const STORAGE_KEY = "tasks-app-tasks";

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateTaskInput {
  title: string;
  note?: string;
  time?: string;
  date?: string;
  recurrence?: Recurrence;
}

export type UpdateTaskInput = CreateTaskInput;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  const persist = useCallback((updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  }, []);

  const addTask = useCallback(
    (input: CreateTaskInput) => {
      // Use the local date as createdAt (yyyy-MM-dd) so weekday calculations
      // are always based on the user's local timezone, not UTC.
      const localToday = toDateKey(new Date());
      const task: Task = {
        id: generateId(),
        title: input.title,
        note: input.note,
        time: input.time,
        date: input.recurrence ? undefined : (input.date ?? localToday),
        recurrence: input.recurrence,
        completedDates: [],
        deletedDates: [],
        createdAt: input.date ?? localToday,
      };
      persist([...tasks, task]);
    },
    [tasks, persist]
  );

  const updateTask = useCallback(
    (id: string, input: UpdateTaskInput) => {
      const updated = tasks.map((t) =>
        t.id === id ? { ...t, ...input } : t
      );
      persist(updated);
    },
    [tasks, persist]
  );

  const deleteTask = useCallback(
    (id: string) => {
      persist(tasks.filter((t) => t.id !== id));
    },
    [tasks, persist]
  );

  const toggleComplete = useCallback(
    (id: string, date: string) => {
      const updated = tasks.map((t) => {
        if (t.id !== id) return t;
        const isCompleted = t.completedDates.includes(date);
        return {
          ...t,
          completedDates: isCompleted
            ? t.completedDates.filter((d) => d !== date)
            : [...t.completedDates, date],
        };
      });
      persist(updated);
    },
    [tasks, persist]
  );

  /** Delete only one occurrence of a recurring task on a specific date */
  const deleteOccurrence = useCallback(
    (id: string, date: string) => {
      const updated = tasks.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          deletedDates: [...(t.deletedDates ?? []), date],
        };
      });
      persist(updated);
    },
    [tasks, persist]
  );

  return { tasks, addTask, updateTask, deleteTask, deleteOccurrence, toggleComplete };
}
