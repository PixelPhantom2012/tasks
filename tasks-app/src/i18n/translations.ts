import type { Language } from "../context/SettingsContext";

type Translations = {
  // Nav / Home
  myTasks: string;
  streak: string;
  backToTasks: string;
  myPlant: string;

  // Settings panel
  settings: string;
  settingsPlant: string;
  settingsBackground: string;
  settingsLanguage: string;
  streakBadge: string;
  showStreakBadge: string;
  hideStreakBadge: string;
  bgDefault: string;
  bgJungle: string;
  langHe: string;
  langEn: string;

  // Week view
  thisWeek: string;
  today: string;
  noTasks: string;
  addTask: string;
  backToCurrentWeek: string;
  weekBack: string;
  weekForward: string;

  // Plant page tips
  howPlantGrows: string;
  perTask: string;
  perfectDay: string;
  stageProg: string;
  noTasksOneDay: string;
  noTasksMany: string;

  // Plant stage labels
  seed: string;
  sprout: string;
  bud: string;
  fullBloom: string;
  stageMax: string;
  nextStage: string;
  streakLabel: string;
  lastStreak: string;
  keepStreak: string;
  missedOne: string;
  missedMany: string;
  startPlant: string;
  stageDays: string;
  stageDaysOne: string;

  // Task modal / debug
  deleteAll: string;
  confirmDeleteAll: string;
  debugTasks: string;
};

const he: Translations = {
  myTasks: "המטלות שלי",
  streak: "רצף",
  backToTasks: "חזרה למטלות",
  myPlant: "הצמח שלי",

  settings: "הגדרות",
  settingsPlant: "צמח",
  settingsBackground: "רקע",
  settingsLanguage: "שפה",
  streakBadge: "תג רצף",
  showStreakBadge: "הצג תג רצף",
  hideStreakBadge: "הסתר תג רצף",
  bgDefault: "ברירת מחדל",
  bgJungle: "ג'ונגל",
  langHe: "עברית",
  langEn: "English",

  thisWeek: "השבוע",
  today: "היום",
  noTasks: "אין מטלות",
  addTask: "הוסף מטלה",
  backToCurrentWeek: "חזרה לשבוע הנוכחי",
  weekBack: "שבוע אחורה",
  weekForward: "שבוע קדימה",

  howPlantGrows: "איך גדל הצמח?",
  perTask: "כל מטלה שמסמן — הצמח מקבל",
  perfectDay: "יום מושלם (כל המטלות) — בונוס נוסף",
  stageProg: "כשמגיעים ל-100% — הצמח עולה שלב (זרע ← נבט ← ניצן ← פריחה)",
  noTasksOneDay: "יום אחד ללא מטלות — הצמח לא זז (חסד)",
  noTasksMany: "יותר מיום ללא מטלות — הרצף נשבר",

  seed: "זרע",
  sprout: "נבט",
  bud: "ניצן",
  fullBloom: "פריחה מלאה",
  stageMax: "שלב מקסימלי 🌺",
  nextStage: "התקדמות לשלב הבא",
  streakLabel: "רצף של",
  lastStreak: "רצף אחרון",
  keepStreak: "שמור על הרצף — המשך לסמן מטלות!",
  missedOne: "יום אחד פספסת — הצמח עדיין בסדר",
  missedMany: "פספסת {n} ימים — הצמח קמל קצת",
  startPlant: "התחל לסמן מטלות כדי לגדל את הצמח!",
  stageDays: "ימים",
  stageDaysOne: "יום",

  deleteAll: "🗑 מחק הכל",
  confirmDeleteAll: "למחוק את כל המטלות?",
  debugTasks: "🐛 Debug: tasks in storage",
};

const en: Translations = {
  myTasks: "My Tasks",
  streak: "Streak",
  backToTasks: "Back to Tasks",
  myPlant: "My Plant",

  settings: "Settings",
  settingsPlant: "Plant",
  settingsBackground: "Background",
  settingsLanguage: "Language",
  streakBadge: "Streak badge",
  showStreakBadge: "Show streak badge",
  hideStreakBadge: "Hide streak badge",
  bgDefault: "Default",
  bgJungle: "Jungle",
  langHe: "עברית",
  langEn: "English",

  thisWeek: "This week",
  today: "Today",
  noTasks: "No tasks",
  addTask: "Add task",
  backToCurrentWeek: "Back to current week",
  weekBack: "Previous week",
  weekForward: "Next week",

  howPlantGrows: "How does the plant grow?",
  perTask: "Each completed task gives the plant",
  perfectDay: "Perfect day (all tasks done) — extra bonus",
  stageProg: "Reaching 100% advances the plant to the next stage",
  noTasksOneDay: "One day without tasks — plant stays (grace)",
  noTasksMany: "More than one day without tasks — streak resets",

  seed: "Seed",
  sprout: "Sprout",
  bud: "Bud",
  fullBloom: "Full Bloom",
  stageMax: "Max stage 🌺",
  nextStage: "Progress to next stage",
  streakLabel: "Streak of",
  lastStreak: "Last streak",
  keepStreak: "Keep the streak — keep completing tasks!",
  missedOne: "You missed a day — the plant is still ok",
  missedMany: "You missed {n} days — the plant wilted a bit",
  startPlant: "Start completing tasks to grow your plant!",
  stageDays: "days",
  stageDaysOne: "day",

  deleteAll: "🗑 Delete all",
  confirmDeleteAll: "Delete all tasks?",
  debugTasks: "🐛 Debug: tasks in storage",
};

const translations: Record<Language, Translations> = { he, en };

export function t(lang: Language, key: keyof Translations, vars?: Record<string, string | number>): string {
  let str = translations[lang][key] as string;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export type { Translations };
