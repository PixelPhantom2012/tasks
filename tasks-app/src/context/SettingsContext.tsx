import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_USER_SETTINGS,
  type UserSettingsPayload,
  fetchUserSettingsFromDb,
  rowToUserSettings,
  upsertUserSettingsToDb,
} from "../lib/userSettingsDb";
import type { Language, Background } from "../types/settings";

export type { Language, Background } from "../types/settings";

interface SettingsContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  background: Background;
  setBackground: (b: Background) => void;
  streakVisible: boolean;
  setStreakVisible: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

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

/** First login after upgrade: move pre-auth global keys into this user, then remove globals. */
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

function readUserSettingsLocal(uid: string): UserSettingsPayload {
  if (!userHasAnyNamespacedKey(uid)) migrateLegacyToUser(uid);
  return {
    language: parseStored(localStorage.getItem(keyLanguage(uid)), DEFAULT_USER_SETTINGS.language),
    background: parseStored(localStorage.getItem(keyBackground(uid)), DEFAULT_USER_SETTINGS.background),
    streakVisible: parseStored(localStorage.getItem(keyStreak(uid)), DEFAULT_USER_SETTINGS.streakVisible),
  };
}

function writeUserSettingsLocal(uid: string, s: UserSettingsPayload): void {
  localStorage.setItem(keyLanguage(uid), JSON.stringify(s.language));
  localStorage.setItem(keyBackground(uid), JSON.stringify(s.background));
  localStorage.setItem(keyStreak(uid), JSON.stringify(s.streakVisible));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [language, setLanguageState] = useState<Language>(DEFAULT_USER_SETTINGS.language);
  const [background, setBackgroundState] = useState<Background>(DEFAULT_USER_SETTINGS.background);
  const [streakVisible, setStreakVisibleState] = useState<boolean>(DEFAULT_USER_SETTINGS.streakVisible);

  // Logged-out: defaults only (no cloud).
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLanguageState(DEFAULT_USER_SETTINGS.language);
      setBackgroundState(DEFAULT_USER_SETTINGS.background);
      setStreakVisibleState(DEFAULT_USER_SETTINGS.streakVisible);
    }
  }, [user?.id, loading]);

  // Logged-in: load from Supabase, subscribe to changes, keep localStorage as offline cache.
  useEffect(() => {
    if (loading || !user) return;
    const uid = user.id;
    let cancelled = false;

    const apply = (s: UserSettingsPayload) => {
      if (cancelled) return;
      setLanguageState(s.language);
      setBackgroundState(s.background);
      setStreakVisibleState(s.streakVisible);
      writeUserSettingsLocal(uid, s);
    };

    apply(readUserSettingsLocal(uid));

    (async () => {
      const res = await fetchUserSettingsFromDb(uid);
      if (cancelled) return;
      if (!res.ok) {
        apply(readUserSettingsLocal(uid));
        return;
      }
      if (res.data) {
        apply(res.data);
        return;
      }
      const local = readUserSettingsLocal(uid);
      apply(local);
      void upsertUserSettingsToDb(uid, local);
    })();

    const channel = supabase
      .channel(`user-settings-${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${uid}` },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          apply(
            rowToUserSettings(
              payload.new as {
                language?: string | null;
                background?: string | null;
                streak_visible?: boolean | null;
              }
            )
          );
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id, loading]);

  const setLanguage = useCallback(
    (l: Language) => {
      setLanguageState(l);
      if (!user) return;
      const next: UserSettingsPayload = { language: l, background, streakVisible };
      writeUserSettingsLocal(user.id, next);
      void upsertUserSettingsToDb(user.id, next);
    },
    [user, background, streakVisible]
  );

  const setBackground = useCallback(
    (b: Background) => {
      setBackgroundState(b);
      if (!user) return;
      const next: UserSettingsPayload = { language, background: b, streakVisible };
      writeUserSettingsLocal(user.id, next);
      void upsertUserSettingsToDb(user.id, next);
    },
    [user, language, streakVisible]
  );

  const setStreakVisible = useCallback(
    (v: boolean) => {
      setStreakVisibleState(v);
      if (!user) return;
      const next: UserSettingsPayload = { language, background, streakVisible: v };
      writeUserSettingsLocal(user.id, next);
      void upsertUserSettingsToDb(user.id, next);
    },
    [user, language, background]
  );

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
