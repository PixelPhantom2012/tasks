import { useState } from "react";
import { format } from "date-fns";
import type { Task } from "../types";
import {
  getWeekStart,
  getWeekDays,
  shiftWeek,
  isCurrentWeek,
  formatWeekRange,
  toDateKey,
  DAY_NAMES_HE,
} from "../utils/dates";
import { getTasksForDate } from "../utils/recurrence";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import type { CreateTaskInput } from "../hooks/useTasks";

interface Props {
  tasks: Task[];
  onAdd: (input: CreateTaskInput) => void;
  onUpdate: (id: string, input: CreateTaskInput) => void;
  onDelete: (id: string) => void;
  onDeleteOccurrence: (id: string, date: string) => void;
  onToggleComplete: (id: string, date: string) => void;
}

export default function WeekView({ tasks, onAdd, onUpdate, onDelete, onDeleteOccurrence, onToggleComplete }: Props) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState<string | undefined>();

  const weekDays = getWeekDays(weekStart);
  const onCurrentWeek = isCurrentWeek(weekStart);
  const todayKey = toDateKey(new Date());

  function openAddModal(dateKey?: string) {
    setAddModalDate(dateKey);
    setAddModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Week header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3">
        {/* Left arrow = go forward (since RTL, visually on the left = future) */}
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, 1))}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          title="שבוע קדימה"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="font-bold text-slate-800 text-base">{formatWeekRange(weekStart)}</span>
          {!onCurrentWeek && (
            <button
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
            >
              חזרה לשבוע הנוכחי
            </button>
          )}
        </div>

        {/* Right arrow = go back (since RTL, visually on the right = past) */}
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, -1))}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          title="שבוע אחורה"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-3">
        {weekDays.map((day) => {
          const dayKey = toDateKey(day);
          const dayTasks = getTasksForDate(tasks, day);
          const isToday = dayKey === todayKey;

          return (
            <div
              key={dayKey}
              className={`rounded-2xl border ${
                isToday
                  ? "border-indigo-400 bg-indigo-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isToday ? "text-indigo-600" : "text-slate-700"}`}>
                    {DAY_NAMES_HE[day.getDay()]}
                  </span>
                  <span className={`text-sm ${isToday ? "text-indigo-500" : "text-slate-400"}`}>
                    {format(day, "d/M")}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5 font-medium">
                      היום
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openAddModal(dayKey)}
                  className="text-slate-400 hover:text-indigo-500 transition-colors p-1 rounded-lg hover:bg-indigo-50"
                  title="הוסף מטלה"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Tasks */}
              <div className="p-3 flex flex-col gap-2">
                {dayTasks.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-2">אין מטלות</p>
                ) : (
                  dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      dateKey={dayKey}
                      onToggleComplete={onToggleComplete}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onDeleteOccurrence={onDeleteOccurrence}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => openAddModal(todayKey)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full px-6 py-3.5 shadow-lg flex items-center gap-2 transition-colors z-40"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        הוסף מטלה
      </button>

      {/* Add modal */}
      <TaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={onAdd}
        initialDate={addModalDate}
        mode="add"
      />
    </div>
  );
}
