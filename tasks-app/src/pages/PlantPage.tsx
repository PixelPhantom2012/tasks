import { Link } from "react-router-dom";
import Plant from "../components/Plant";
import { useTasks } from "../hooks/useTasks";
import { useStreak, getMissedDays, XP_PER_TASK, XP_PERFECT_DAY } from "../hooks/useStreak";
import { useSettings } from "../context/SettingsContext";
import { t } from "../i18n/translations";

export default function PlantPage() {
  const { tasks } = useTasks();
  const { streak, stage, growthPct } = useStreak(tasks);
  const missedDays = getMissedDays(tasks);
  const { language } = useSettings();

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {t(language, "backToTasks")}
          </Link>
          <h1 className="text-xl font-bold text-slate-800">{t(language, "myPlant")}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm border border-slate-200 p-8">
          <Plant stage={stage} growthPct={growthPct} streak={streak} missedDays={missedDays} />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-700 mb-3 text-sm">{t(language, "howPlantGrows")}</h2>
          <ul className="flex flex-col gap-2">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-green-500 mt-0.5">✓</span>
              {t(language, "perTask")} +{XP_PER_TASK}%
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-yellow-500 mt-0.5">⭐</span>
              {t(language, "perfectDay")} +{XP_PERFECT_DAY}%
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-green-500 mt-0.5">✓</span>
              {t(language, "stageProg")}
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-amber-500 mt-0.5">!</span>
              {t(language, "noTasksOneDay")}
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-red-400 mt-0.5">✗</span>
              {t(language, "noTasksMany")}
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
