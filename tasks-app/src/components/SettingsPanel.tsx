import { useState } from "react";
import { useSettings, type Background, type Language } from "../context/SettingsContext";
import { t } from "../i18n/translations";

type Tab = "plant" | "background" | "language";

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("plant");
  const { language, setLanguage, background, setBackground, streakVisible, setStreakVisible } = useSettings();

  const isRtl = language === "he";

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "plant", label: t(language, "settingsPlant"), icon: "🌱" },
    { id: "background", label: t(language, "settingsBackground"), icon: "🖼️" },
    { id: "language", label: t(language, "settingsLanguage"), icon: "🌐" },
  ];

  return (
    <>
      {/* Gear button — top-left in RTL (Hebrew), top-right in LTR (English) */}
      <button
        onClick={() => setOpen(true)}
        style={{ position: "fixed", top: "12px", [isRtl ? "right" : "left"]: "12px", zIndex: 50 }}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur border border-slate-200 shadow-md hover:bg-white hover:shadow-lg transition-all text-slate-600 hover:text-slate-800"
        title={t(language, "settings")}
        aria-label={t(language, "settings")}
      >
        <GearIcon />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel — slides in from the same side as the gear button */}
      <div
        className={`fixed top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isRtl ? "right-0" : "left-0"
        } ${open ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{t(language, "settings")}</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex flex-col items-center gap-0.5 ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "plant" && (
            <PlantTab
              streakVisible={streakVisible}
              onToggleStreak={() => setStreakVisible(!streakVisible)}
              language={language}
            />
          )}
          {activeTab === "background" && (
            <BackgroundTab
              background={background}
              onSelect={setBackground}
              language={language}
            />
          )}
          {activeTab === "language" && (
            <LanguageTab
              language={language}
              onSelect={setLanguage}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ── Plant tab ──────────────────────────────────────────────────────────────────
function PlantTab({
  streakVisible,
  onToggleStreak,
  language,
}: {
  streakVisible: boolean;
  onToggleStreak: () => void;
  language: Language;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">{t(language, "settingsPlant")}</p>

      {/* Streak badge toggle */}
      <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-slate-700">{t(language, "streakBadge")}</span>
          <span className="text-xs text-slate-400">
            {streakVisible ? t(language, "showStreakBadge") : t(language, "hideStreakBadge")}
          </span>
        </div>
        <Toggle checked={streakVisible} onChange={onToggleStreak} />
      </div>
    </div>
  );
}

// ── Background tab ─────────────────────────────────────────────────────────────
const base = import.meta.env.BASE_URL; // "/tasks/" in production, "/" in dev

const BG_OPTIONS: { id: Background; label: (l: Language) => string; preview: string }[] = [
  {
    id: "default",
    label: (l) => t(l, "bgDefault"),
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  },
  {
    id: "jungle",
    label: (l) => t(l, "bgJungle"),
    preview: `url('${base}bg-jungle.png') center/cover`,
  },
  {
    id: "night",
    label: (l) => t(l, "bgNight"),
    preview: `url('${base}bg-night.jpg') center/cover`,
  },
  {
    id: "ocean",
    label: (l) => t(l, "bgOcean"),
    preview: `url('${base}bg-ocean.jpg') center/cover`,
  },
];

function BackgroundTab({
  background,
  onSelect,
  language,
}: {
  background: Background;
  onSelect: (b: Background) => void;
  language: Language;
}) {
  return (
    <div className="flex flex-col gap-3">
      {BG_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
            background === opt.id
              ? "border-indigo-400 bg-indigo-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          {/* Mini preview swatch */}
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 border border-slate-200"
            style={{ background: opt.preview }}
          />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-medium text-slate-700">{opt.label(language)}</span>
            {background === opt.id && (
              <span className="text-xs text-indigo-500 font-medium">✓</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Language tab ──────────────────────────────────────────────────────────────
const LANG_OPTIONS: { id: Language; native: string; flag: string }[] = [
  { id: "he", native: "עברית", flag: "🇮🇱" },
  { id: "en", native: "English", flag: "🇺🇸" },
];

function LanguageTab({
  language,
  onSelect,
}: {
  language: Language;
  onSelect: (l: Language) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {LANG_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
            language === opt.id
              ? "border-indigo-400 bg-indigo-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="text-2xl">{opt.flag}</span>
          <span className="text-sm font-medium text-slate-700">{opt.native}</span>
          {language === opt.id && (
            <span className="ms-auto text-xs text-indigo-500 font-medium">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        checked ? "bg-indigo-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
