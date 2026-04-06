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

      <main className="max-w-lg mx-auto px-4 py-6 pb-28">
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
