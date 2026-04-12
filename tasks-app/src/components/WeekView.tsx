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
  DAY_NAMES_EN,
} from "../utils/dates";
import { getTasksForDate } from "../utils/recurrence";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import type { CreateTaskInput } from "../hooks/useTasks";
import { useSettings } from "../context/SettingsContext";
import { t } from "../i18n/translations";

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
  const { language } = useSettings();

  const weekDays = getWeekDays(weekStart);
  const onCurrentWeek = isCurrentWeek(weekStart);
  const todayKey = toDateKey(new Date());
  const DAY_NAMES = language === "he" ? DAY_NAMES_HE : DAY_NAMES_EN;

  function openAddModal(dateKey?: string) {
    setAddModalDate(dateKey);
    setAddModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Week header */}
      <div className="flex items-stretch justify-between gap-1 bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-slate-200 px-2 py-3 sm:px-4">
        {/* In RTL: visually right = go back (chevron-right). In LTR: visually left = go back (chevron-left) */}
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, -1))}
          className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          title={t(language, "weekBack")}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {language === "he"
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />}
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5">
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center font-bold text-slate-800 text-xs sm:text-base">
            <span className="break-words">{formatWeekRange(weekStart, DAY_NAMES).start}</span>
            <span className="text-slate-400 font-normal shrink-0">–</span>
            <span className="break-words">{formatWeekRange(weekStart, DAY_NAMES).end}</span>
          </div>
          {!onCurrentWeek && (
            <button
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
            >
              {t(language, "backToCurrentWeek")}
            </button>
          )}
        </div>

        {/* In RTL: visually left = go forward (chevron-left). In LTR: visually right = go forward (chevron-right) */}
        <button
          onClick={() => setWeekStart((w) => shiftWeek(w, 1))}
          className="p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          title={t(language, "weekForward")}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {language === "he"
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />}
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
                  ? "border-indigo-400 bg-indigo-50/80 backdrop-blur"
                  : "border-slate-200 bg-white/90 backdrop-blur"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isToday ? "text-indigo-600" : "text-slate-700"}`}>
                    {DAY_NAMES[day.getDay()]}
                  </span>
                  <span className={`text-sm ${isToday ? "text-indigo-500" : "text-slate-400"}`}>
                    {format(day, "d/M")}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5 font-medium">
                      {t(language, "today")}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openAddModal(dayKey)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50 active:bg-indigo-100"
                  title={t(language, "addTask")}
                  aria-label={t(language, "addTask")}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Tasks */}
              <div className="p-3 flex flex-col gap-2">
                {dayTasks.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-2">{t(language, "noTasks")}</p>
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

      {/* Floating add button — above home bar on iPhone */}
      <button
        onClick={() => openAddModal(todayKey)}
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        className="fixed left-1/2 -translate-x-1/2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-full px-6 py-3.5 shadow-lg flex items-center gap-2 transition-colors z-40"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {t(language, "addTask")}
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
