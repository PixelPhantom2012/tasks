import { useState, useEffect, useCallback } from "react";
import type { Task, Recurrence } from "../types";
import { toDateKey } from "../utils/dates";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export interface CreateTaskInput {
  title: string;
  note?: string;
  time?: string;
  date?: string;
  recurrence?: Recurrence;
}

export type UpdateTaskInput = CreateTaskInput;

// ── DB row ↔ Task shape helpers ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    note: row.note ?? undefined,
    time: row.time ?? undefined,
    date: row.date ?? undefined,
    recurrence: row.recurrence ?? undefined,
    completedDates: row.completed_dates ?? [],
    completedTimestamps: row.completed_timestamps ?? {},
    deletedDates: row.deleted_dates ?? [],
    createdAt: row.created_at_local,
  };
}

function taskToRow(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    note: task.note ?? null,
    time: task.time ?? null,
    date: task.date ?? null,
    recurrence: task.recurrence ?? null,
    completed_dates: task.completedDates,
    completed_timestamps: task.completedTimestamps ?? {},
    deleted_dates: task.deletedDates,
    created_at_local: task.createdAt,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dbReady, setDbReady] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (!user) { setTasks([]); setDbReady(false); return; }

    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at_local", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setTasks(data.map(rowToTask));
        setDbReady(true);
      });

    // Real-time subscription
    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, rowToTask(payload.new)]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) => prev.map((t) => t.id === payload.new.id ? rowToTask(payload.new) : t));
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!user) return;
      const localToday = toDateKey(new Date());
      const task: Task = {
        id: generateId(),
        title: input.title,
        note: input.note,
        time: input.time,
        date: input.recurrence ? undefined : (input.date ?? localToday),
        recurrence: input.recurrence,
        completedDates: [],
        completedTimestamps: {},
        deletedDates: [],
        createdAt: input.date ?? localToday,
      };
      // No optimistic update — the real-time INSERT event will add it to state
      const { error } = await supabase.from("tasks").insert(taskToRow(task, user.id));
      if (error) console.error("addTask error:", error.message);
    },
    [user]
  );

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      if (!user) return;
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...input } : t));
      const updated = tasks.find((t) => t.id === id);
      if (!updated) return;
      const merged = { ...updated, ...input };
      const { error } = await supabase
        .from("tasks")
        .update(taskToRow(merged, user.id))
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) console.error("updateTask error:", error.message);
    },
    [user, tasks]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!user) return;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) console.error("deleteTask error:", error.message);
    },
    [user]
  );

  const toggleComplete = useCallback(
    async (id: string, date: string) => {
      if (!user) return;
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const isCompleted = task.completedDates.includes(date);
      const nextTs = { ...(task.completedTimestamps ?? {}) };
      if (isCompleted) {
        delete nextTs[date];
      } else {
        nextTs[date] = new Date().toISOString();
      }
      const updated: Task = {
        ...task,
        completedDates: isCompleted
          ? task.completedDates.filter((d) => d !== date)
          : [...task.completedDates, date],
        completedTimestamps: nextTs,
      };
      setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
      const { error } = await supabase
        .from("tasks")
        .update({
          completed_dates: updated.completedDates,
          completed_timestamps: updated.completedTimestamps,
        })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) console.error("toggleComplete error:", error.message);
    },
    [user, tasks]
  );

  const deleteOccurrence = useCallback(
    async (id: string, date: string) => {
      if (!user) return;
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const updated: Task = {
        ...task,
        deletedDates: [...(task.deletedDates ?? []), date],
      };
      setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_dates: updated.deletedDates })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) console.error("deleteOccurrence error:", error.message);
    },
    [user, tasks]
  );

  return { tasks, dbReady, addTask, updateTask, deleteTask, deleteOccurrence, toggleComplete };
}
