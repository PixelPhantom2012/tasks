-- Run once in Supabase → SQL Editor (or via Supabase CLI).
-- Stores UI preferences per account (syncs across devices).

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'he',
  background text not null default 'default',
  streak_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;

create policy "user_settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Real-time (skip this line if you get "already exists" — table is already in the publication)
alter publication supabase_realtime add table public.user_settings;
