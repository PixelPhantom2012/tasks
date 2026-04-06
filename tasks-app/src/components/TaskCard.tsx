import { useState } from "react";
import confetti from "canvas-confetti";
import type { Task } from "../types";
import type { CreateTaskInput } from "../hooks/useTasks";
import TaskModal from "./TaskModal";

interface Props {
  task: Task;
  dateKey: string;
  onToggleComplete: (id: string, date: string) => void;
  onUpdate: (id: string, input: CreateTaskInput) => void;
  onDelete: (id: string) => void;
  onDeleteOccurrence: (id: string, date: string) => void;
}

export default function TaskCard({
  task,
  dateKey,
  onToggleComplete,
  onUpdate,
  onDelete,
  onDeleteOccurrence,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const isCompleted = task.completedDates.includes(dateKey);

  function handleToggle() {
    const willComplete = !isCompleted;
    onToggleComplete(task.id, dateKey);
    if (willComplete) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6"],
      });
    }
  }

  const recurrenceLabel = () => {
    if (!task.recurrence) return null;
    const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    switch (task.recurrence.type) {
      case "daily": return "חוזר כל יום";
      case "weekly": return "חוזר כל שבוע";
      case "interval": return `חוזר כל ${task.recurrence.intervalDays} ימים`;
      case "days-of-week": {
        const days = (task.recurrence.daysOfWeek ?? []).map((d) => DAY_NAMES[d]).join(", ");
        return `חוזר: ${days}`;
      }
    }
  };

  return (
    <>
      <div
        className={`group flex items-start gap-3 rounded-xl p-3 border transition-all ${
          isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm"
        }`}
      >
        {/* Checkbox — min 44px tap area for mobile */}
        <button
          onClick={handleToggle}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-slate-300 hover:border-indigo-400"
          }`}
          title={isCompleted ? "ביטול בוצע" : "בוצע"}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
            {task.title}
          </p>
          {task.note && (
            <p className={`text-xs mt-0.5 ${isCompleted ? "text-slate-300" : "text-slate-500"}`}>
              {task.note}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.time && (
              <span className="text-xs text-indigo-500 font-medium">{task.time}</span>
            )}
            {task.recurrence && (
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                {recurrenceLabel()}
              </span>
            )}
          </div>
        </div>

        {/* Edit button — always visible on mobile, hover-only on desktop */}
        <button
          onClick={() => setEditOpen(true)}
          className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          title="עריכה"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
          </svg>
        </button>
      </div>

      <TaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(input) => onUpdate(task.id, input)}
        onDeleteAll={() => onDelete(task.id)}
        onDeleteOccurrence={() => onDeleteOccurrence(task.id, dateKey)}
        task={task}
        mode="edit"
      />
    </>
  );
}
