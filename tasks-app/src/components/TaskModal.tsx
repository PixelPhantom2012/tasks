import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Task, Recurrence, RecurrenceType } from "../types";
import type { CreateTaskInput } from "../hooks/useTasks";
import { toDateKey } from "../utils/dates";

const DAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const DAY_FULL = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateTaskInput) => void;
  onDeleteAll?: () => void;
  onDeleteOccurrence?: () => void;
  initialDate?: string;
  task?: Task;
  mode: "add" | "edit";
}

export default function TaskModal({
  open,
  onClose,
  onSave,
  onDeleteAll,
  onDeleteOccurrence,
  initialDate,
  task,
  mode,
}: Props) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(initialDate ?? toDateKey(new Date()));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("weekly");
  const [intervalDays, setIntervalDays] = useState(7);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setShowDeleteConfirm(false);
      if (task) {
        setTitle(task.title);
        setNote(task.note ?? "");
        setTime(task.time ?? "");
        setDate(task.date ?? toDateKey(new Date()));
        if (task.recurrence) {
          setIsRecurring(true);
          setRecurrenceType(task.recurrence.type);
          setIntervalDays(task.recurrence.intervalDays ?? 7);
          setDaysOfWeek(task.recurrence.daysOfWeek ?? []);
        } else {
          setIsRecurring(false);
          setRecurrenceType("weekly");
          setIntervalDays(7);
          setDaysOfWeek([]);
        }
      } else {
        setTitle("");
        setNote("");
        setTime("");
        setDate(initialDate ?? toDateKey(new Date()));
        setIsRecurring(false);
        setRecurrenceType("weekly");
        setIntervalDays(7);
        setDaysOfWeek([]);
      }
    }
  }, [open, task, initialDate]);

  if (!open) return null;

  function toggleDay(d: number) {
    setDaysOfWeek((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleSave() {
    if (!title.trim()) return;

    let recurrence: Recurrence | undefined;
    if (isRecurring) {
      recurrence = { type: recurrenceType };
      if (recurrenceType === "interval") recurrence.intervalDays = intervalDays;
      if (recurrenceType === "days-of-week") recurrence.daysOfWeek = daysOfWeek;
    }

    const input: CreateTaskInput = {
      title: title.trim(),
      note: note.trim() || undefined,
      time: time || undefined,
      date: date || undefined,
      recurrence,
    };
    onSave(input);
    onClose();
  }

  function handleDeleteClick() {
    const isCurrentlyRecurring = task?.recurrence != null;
    if (isCurrentlyRecurring) {
      setShowDeleteConfirm(true);
    } else {
      onDeleteAll?.();
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center overscroll-none"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90dvh] w-full flex-col gap-4 overflow-y-auto overscroll-y-contain rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl sm:mx-4 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Delete confirmation overlay for recurring tasks */}
        {showDeleteConfirm ? (
          <>
            <h2 className="text-xl font-bold text-slate-800">מחיקת מטלה חוזרת</h2>
            <p className="text-sm text-slate-600">מה ברצונך למחוק?</p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => { onDeleteOccurrence?.(); onClose(); }}
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-xl py-3 text-sm transition-colors border border-orange-200"
              >
                רק את ההופעה הזו
              </button>
              <button
                onClick={() => { onDeleteAll?.(); onClose(); }}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl py-3 text-sm transition-colors border border-red-200"
              >
                את כל המטלה החוזרת
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl py-3 text-sm transition-colors"
              >
                ביטול
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-800">
              {mode === "add" ? "הוספת מטלה" : "עריכת מטלה"}
            </h2>

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">כותרת *</label>
              <input
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:py-2 sm:text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="שם המטלה"
                autoFocus
              />
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">הערה</label>
              <textarea
                className="resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:py-2 sm:text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="הערה אופציונלית"
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">שעה</label>
              <input
                type="time"
                className="w-full max-w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-36 sm:py-2 sm:text-sm"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            {/* Recurring toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRecurring((p) => !p)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  isRecurring ? "bg-indigo-500" : "bg-slate-300"
                }`}
                aria-pressed={isRecurring}
              >
                <span
                  className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${
                    isRecurring ? "end-0.5" : "start-0.5"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700">מטלה חוזרת</span>
            </div>

            {/* Recurrence options */}
            {isRecurring && (
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-600">סוג חזרה</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:py-2 sm:text-sm"
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                  >
                    <option value="daily">כל יום</option>
                    <option value="weekly">כל שבוע (אותו יום)</option>
                    <option value="interval">כל X ימים</option>
                    <option value="days-of-week">ימים ספציפיים בשבוע</option>
                  </select>
                </div>

                {recurrenceType === "interval" && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-600">כל</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-20"
                      value={intervalDays}
                      onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <span className="text-sm text-slate-600">ימים</span>
                  </div>
                )}

                {recurrenceType === "days-of-week" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-600">בחר ימים</label>
                    <div className="flex gap-1 flex-wrap">
                      {DAY_LABELS.map((label, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleDay(idx)}
                          className={`min-h-[40px] min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium border transition-colors sm:min-h-0 sm:min-w-0 sm:py-1.5 ${
                            daysOfWeek.includes(idx)
                              ? "bg-indigo-500 text-white border-indigo-500"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                          title={DAY_FULL[idx]}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Date (only for one-off tasks) */}
            {!isRecurring && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">תאריך</label>
                <input
                  type="date"
                  className="w-full max-w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:max-w-[11rem] sm:py-2 sm:text-sm"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            {/* Actions — stacked full-width on narrow screens; row on sm+ */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-row-reverse sm:items-stretch">
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className="order-1 w-full rounded-xl bg-indigo-500 py-3 font-semibold text-white transition-colors hover:bg-indigo-600 disabled:bg-slate-300 sm:order-none sm:flex-1 sm:py-2.5"
              >
                {mode === "add" ? "הוסף" : "שמור"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="order-2 w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-200 sm:order-none sm:flex-1 sm:py-2.5"
              >
                ביטול
              </button>
              {mode === "edit" && (onDeleteAll || onDeleteOccurrence) && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="order-3 w-full rounded-xl bg-red-50 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100 sm:order-none sm:w-auto sm:px-5 sm:py-2.5"
                >
                  מחק
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
