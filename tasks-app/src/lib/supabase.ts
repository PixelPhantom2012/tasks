import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/** True when real project env vars are set (see `.env.example`). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Missing env would make createClient throw at import time → blank page. Use harmless placeholders for local UI-only dev.
const url = supabaseUrl || "http://127.0.0.1:54321";
const anonKey = supabaseAnonKey || "local-dev-placeholder-not-a-real-key";

export const supabase = createClient(url, anonKey);
