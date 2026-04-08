# Planning — Ideas & Future Features

Write your ideas here. When ready to implement, move them to the "Ready" section.

---

## 💡 Ideas (raw, not yet evaluated)

> Add your ideas here freely — no need to be detailed yet.

---

## ✅ Ready to Implement

> Ideas that are clear enough to build. Will be turned into tasks.


---

## 🚧 In Progress

> Currently being worked on.

---

## ✔️ Done

> Implemented ideas (with date).

- **08/04/2026** — Per-user settings: Phase 1 — namespaced `localStorage` + provider order (see earlier). Phase 2 — Supabase `user_settings` table (`supabase/migrations/20260408140000_user_settings.sql`): fetch on login, upsert on change, Realtime subscription so other devices update live; `localStorage` remains a fast cache. **Run the SQL in the Supabase dashboard once** or the app falls back to local-only.

- **06/04/2026 10:13** — Fixed auth bug: new users got "Email not confirmed" error after signup.
  Root cause: Supabase email confirmation was enabled by default.
  Fix: Disabled "Confirm email" in Supabase → Authentication → Providers → Email. Users can now sign up and log in immediately.

- **06/04/2026 09:43** — Improved auth error messages: "email already registered" on duplicate signup, "incorrect email or password" on bad login. Removed email verification flow (confusing UX). Fixed Supabase identity check to detect already-registered emails.

- **06/04/2026 07:50** — Bug fix: Adding a task created it twice.
  Cause: optimistic update + real-time INSERT event both added the task to state.
  Fix: removed the optimistic update from `addTask` — now relies solely on the real-time subscription.

- **06/04/2026 07:42** — Integrated Supabase: user authentication (signup/login/logout) + cloud task sync with real-time updates across devices.
  Tasks moved from `localStorage` to a Supabase `tasks` table with Row Level Security.
  New files: `src/lib/supabase.ts`, `src/context/AuthContext.tsx`, `src/pages/LoginPage.tsx`.

- **06/04/2026 07:31** — Added 3 new backgrounds: Mountain 🏔️, City 🌆, Gradient 🎨.
  Mountain and City use downloaded images from Unsplash. Gradient is a pure CSS animated gradient (no image).

- **06/04/2026 07:24** — Bug fix: Edit task modal appeared behind the background overlay.
  Solved by wrapping `TaskModal` with `createPortal` so it renders directly on `document.body`, above all layers.
  See [`BUG-modal-behind-background.md`](./BUG-modal-behind-background.md) for full details.

---
