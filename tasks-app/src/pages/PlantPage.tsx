import { Link } from "react-router-dom";
import Plant from "../components/Plant";
import { useTasks } from "../hooks/useTasks";
import { useStreak, getMissedDays } from "../hooks/useStreak";

export default function PlantPage() {
  const { tasks } = useTasks();
  const { streak, plantLevel } = useStreak(tasks);
  const missedDays = getMissedDays(tasks);

  // Apply shrink penalty: after 1 grace day, plant shrinks 1 level per missed day
  const shrinkAmount = missedDays > 1 ? missedDays - 1 : 0;
  const displayLevel = Math.max(0, plantLevel - shrinkAmount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            חזרה למטלות
          </Link>
          <h1 className="text-xl font-bold text-slate-800">הצמח שלי</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <Plant level={displayLevel} streak={streak} missedDays={missedDays} />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-700 mb-3 text-sm">איך גדל הצמח?</h2>
          <ul className="flex flex-col gap-2">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-green-500 mt-0.5">✓</span>
              סמן לפחות מטלה אחת ביום כדי לשמור על הרצף
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-green-500 mt-0.5">✓</span>
              כל 2 ימים ברצף — הצמח עולה שלב
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-amber-500 mt-0.5">!</span>
              יום אחד ללא מטלות — הצמח לא זז (חסד)
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-red-400 mt-0.5">✗</span>
              יותר מיום ללא מטלות — הצמח קומל שלב אחד לכל יום
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
