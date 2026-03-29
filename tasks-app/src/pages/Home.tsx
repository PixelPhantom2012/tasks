import { Link } from "react-router-dom";
import WeekView from "../components/WeekView";
import { useTasks } from "../hooks/useTasks";
import { useStreak } from "../hooks/useStreak";

export default function Home() {
  const { tasks, addTask, updateTask, deleteTask, deleteOccurrence, toggleComplete } = useTasks();
  const { streak } = useStreak(tasks);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">המטלות שלי</h1>
          <Link
            to="/plant"
            className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span className="text-base">🌱</span>
            <span>רצף: {streak}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* DEBUG PANEL — remove after diagnosing */}
        <details className="mb-4 bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-xs font-mono">
          <summary className="cursor-pointer font-bold text-yellow-800">🐛 Debug: tasks in storage ({tasks.length})</summary>
          <div className="mt-2 flex flex-col gap-2">
            {tasks.map((t) => (
              <div key={t.id} className="bg-white border border-yellow-200 rounded p-2">
                <div><b>title:</b> {t.title}</div>
                <div><b>id:</b> {t.id}</div>
                <div><b>createdAt:</b> {t.createdAt}</div>
                <div><b>date:</b> {t.date ?? "(none)"}</div>
                <div><b>recurrence:</b> {t.recurrence ? JSON.stringify(t.recurrence) : "(none)"}</div>
                <div><b>completedDates:</b> [{t.completedDates.join(", ") || "—"}]</div>
                <div><b>deletedDates:</b> [{(t.deletedDates ?? []).join(", ") || "—"}]</div>
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
