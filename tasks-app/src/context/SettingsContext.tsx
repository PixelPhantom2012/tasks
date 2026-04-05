import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "he" | "en";
export type Background = "default" | "jungle" | "night" | "ocean";

interface SettingsContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  background: Background;
  setBackground: (b: Background) => void;
  streakVisible: boolean;
  setStreakVisible: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSetting<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    loadSetting<Language>("settings_language", "he")
  );
  const [background, setBackgroundState] = useState<Background>(() =>
    loadSetting<Background>("settings_background", "default")
  );
  const [streakVisible, setStreakVisibleState] = useState<boolean>(() =>
    loadSetting<boolean>("settings_streakVisible", true)
  );

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("settings_language", JSON.stringify(l));
  };
  const setBackground = (b: Background) => {
    setBackgroundState(b);
    localStorage.setItem("settings_background", JSON.stringify(b));
  };
  const setStreakVisible = (v: boolean) => {
    setStreakVisibleState(v);
    localStorage.setItem("settings_streakVisible", JSON.stringify(v));
  };

  // Sync HTML dir attribute with language
  useEffect(() => {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <SettingsContext.Provider
      value={{ language, setLanguage, background, setBackground, streakVisible, setStreakVisible }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
