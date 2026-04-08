import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type Language = "he" | "en";
export type Background = "default" | "jungle" | "night" | "ocean" | "mountain" | "city" | "gradient";

interface SettingsContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  background: Background;
  setBackground: (b: Background) => void;
  streakVisible: boolean;
  setStreakVisible: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT_LANGUAGE: Language = "he";
const DEFAULT_BACKGROUND: Background = "default";
const DEFAULT_STREAK_VISIBLE = true;

const LEGACY_LANGUAGE = "settings_language";
const LEGACY_BACKGROUND = "settings_background";
const LEGACY_STREAK = "settings_streakVisible";

function keyLanguage(uid: string) {
  return `settings_language:${uid}`;
}
function keyBackground(uid: string) {
  return `settings_background:${uid}`;
}
function keyStreak(uid: string) {
  return `settings_streakVisible:${uid}`;
}

function parseStored<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function userHasAnyNamespacedKey(uid: string): boolean {
  return (
    localStorage.getItem(keyLanguage(uid)) !== null ||
    localStorage.getItem(keyBackground(uid)) !== null ||
    localStorage.getItem(keyStreak(uid)) !== null
  );
}

/** First login after upgrade: move pre-auth global keys into this user, then remove globals (avoids leaking prefs to the next account). */
function migrateLegacyToUser(uid: string): void {
  const legL = localStorage.getItem(LEGACY_LANGUAGE);
  const legB = localStorage.getItem(LEGACY_BACKGROUND);
  const legS = localStorage.getItem(LEGACY_STREAK);
  if (legL === null && legB === null && legS === null) return;
  if (legL !== null) localStorage.setItem(keyLanguage(uid), legL);
  if (legB !== null) localStorage.setItem(keyBackground(uid), legB);
  if (legS !== null) localStorage.setItem(keyStreak(uid), legS);
  localStorage.removeItem(LEGACY_LANGUAGE);
  localStorage.removeItem(LEGACY_BACKGROUND);
  localStorage.removeItem(LEGACY_STREAK);
}

function readUserSettings(uid: string): {
  language: Language;
  background: Background;
  streakVisible: boolean;
} {
  if (!userHasAnyNamespacedKey(uid)) migrateLegacyToUser(uid);
  return {
    language: parseStored(localStorage.getItem(keyLanguage(uid)), DEFAULT_LANGUAGE),
    background: parseStored(localStorage.getItem(keyBackground(uid)), DEFAULT_BACKGROUND),
    streakVisible: parseStored(localStorage.getItem(keyStreak(uid)), DEFAULT_STREAK_VISIBLE),
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [background, setBackgroundState] = useState<Background>(DEFAULT_BACKGROUND);
  const [streakVisible, setStreakVisibleState] = useState<boolean>(DEFAULT_STREAK_VISIBLE);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLanguageState(DEFAULT_LANGUAGE);
      setBackgroundState(DEFAULT_BACKGROUND);
      setStreakVisibleState(DEFAULT_STREAK_VISIBLE);
      return;
    }
    const s = readUserSettings(user.id);
    setLanguageState(s.language);
    setBackgroundState(s.background);
    setStreakVisibleState(s.streakVisible);
  }, [user?.id, loading]);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    if (user) localStorage.setItem(keyLanguage(user.id), JSON.stringify(l));
  }, [user]);

  const setBackground = useCallback((b: Background) => {
    setBackgroundState(b);
    if (user) localStorage.setItem(keyBackground(user.id), JSON.stringify(b));
  }, [user]);

  const setStreakVisible = useCallback((v: boolean) => {
    setStreakVisibleState(v);
    if (user) localStorage.setItem(keyStreak(user.id), JSON.stringify(v));
  }, [user]);

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
