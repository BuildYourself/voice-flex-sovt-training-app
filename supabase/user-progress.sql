create extension if not exists pgcrypto;

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_program_id uuid references public.programs(id),
  current_day int default 1,
  day_streak int default 0,
  total_minutes numeric default 0,
  sessions_completed int default 0,
  last_session_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  program_id uuid references public.programs(id),
  program_day_id uuid references public.program_days(id),
  session_name text,
  completed_at timestamptz default now(),
  total_minutes numeric,
  steps_completed int,
  created_at timestamptz default now()
);

alter table public.user_progress enable row level security;
alter table public.user_sessions enable row level security;

drop policy if exists "Users can read own progress" on public.user_progress;
create policy "Users can read own progress"
  on public.user_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress"
  on public.user_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own sessions" on public.user_sessions;
create policy "Users can read own sessions"
  on public.user_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own sessions" on public.user_sessions;
create policy "Users can insert own sessions"
  on public.user_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update on public.user_progress to authenticated;
grant select, insert on public.user_sessions to authenticated;

