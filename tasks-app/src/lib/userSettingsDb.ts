import { supabase } from "./supabase";
import type { Language, Background } from "../types/settings";

const LANGS: Language[] = ["he", "en"];
const BGS: Background[] = [
  "default",
  "jungle",
  "night",
  "ocean",
  "mountain",
  "city",
  "gradient",
];

export interface UserSettingsPayload {
  language: Language;
  background: Background;
  streakVisible: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettingsPayload = {
  language: "he",
  background: "default",
  streakVisible: true,
};

function coerceLanguage(v: unknown): Language {
  return typeof v === "string" && LANGS.includes(v as Language)
    ? (v as Language)
    : DEFAULT_USER_SETTINGS.language;
}

function coerceBackground(v: unknown): Background {
  return typeof v === "string" && BGS.includes(v as Background)
    ? (v as Background)
    : DEFAULT_USER_SETTINGS.background;
}

function coerceBool(v: unknown): boolean {
  return typeof v === "boolean" ? v : DEFAULT_USER_SETTINGS.streakVisible;
}

export function rowToUserSettings(row: {
  language?: string | null;
  background?: string | null;
  streak_visible?: boolean | null;
}): UserSettingsPayload {
  return {
    language: coerceLanguage(row.language),
    background: coerceBackground(row.background),
    streakVisible: coerceBool(row.streak_visible),
  };
}

export async function fetchUserSettingsFromDb(
  userId: string
): Promise<{ ok: true; data: UserSettingsPayload | null } | { ok: false }> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("language, background, streak_visible")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { ok: false };
  if (!data) return { ok: true, data: null };
  return { ok: true, data: rowToUserSettings(data) };
}

export async function upsertUserSettingsToDb(
  userId: string,
  s: UserSettingsPayload
): Promise<boolean> {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      language: s.language,
      background: s.background,
      streak_visible: s.streakVisible,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  return !error;
}
