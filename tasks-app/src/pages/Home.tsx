import { Link } from "react-router-dom";
import WeekView from "../components/WeekView";
import { useTasks } from "../hooks/useTasks";
import { useStreak } from "../hooks/useStreak";
import { useSettings } from "../context/SettingsContext";
import { t } from "../i18n/translations";

export default function Home() {
  const { tasks, addTask, updateTask, deleteTask, deleteOccurrence, toggleComplete } = useTasks();
  const { streak } = useStreak(tasks);
  const { language, streakVisible } = useSettings();

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{t(language, "myTasks")}</h1>
          {streakVisible && (
            <Link
              to="/plant"
              className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <span className="text-base">🌱</span>
              <span>{t(language, "streak")}: {streak}</span>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* DEBUG PANEL — remove after diagnosing */}
        <details className="mb-4 bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-xs font-mono">
          <summary className="cursor-pointer font-bold text-yellow-800">{t(language, "debugTasks")} ({tasks.length})</summary>
          <div className="mt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                if (confirm(t(language, "confirmDeleteAll"))) {
                  tasks.forEach((task) => deleteTask(task.id));
                }
              }}
              className="self-start bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded text-xs"
            >
              {t(language, "deleteAll")}
            </button>
            {tasks.map((task) => (
              <div key={task.id} className="bg-white border border-yellow-200 rounded p-2">
                <div><b>title:</b> {task.title}</div>
                <div><b>id:</b> {task.id}</div>
                <div><b>createdAt:</b> {task.createdAt}</div>
                <div><b>date:</b> {task.date ?? "(none)"}</div>
                <div><b>recurrence:</b> {task.recurrence ? JSON.stringify(task.recurrence) : "(none)"}</div>
                <div><b>completedDates:</b> [{task.completedDates.join(", ") || "—"}]</div>
                <div><b>deletedDates:</b> [{(task.deletedDates ?? []).join(", ") || "—"}]</div>
              </div>
            ))}
          </div>
        </details>

        <WeekView
          tasks={tasks}
          onAdd={addTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onDeleteOccurrence={deleteOccurrence}
          onToggleComplete={toggleComplete}
        />
      </main>
    </div>
  );
}
