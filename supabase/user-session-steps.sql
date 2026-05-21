create extension if not exists pgcrypto;

create table if not exists public.user_session_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  exercise_id text not null,
  step_index integer not null,
  status text not null default 'completed',
  duration_sec integer not null default 0,
  completed_at timestamptz not null default now(),
  session_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, session_id, exercise_id, step_index, session_date)
);

create index if not exists idx_user_session_steps_user_id on public.user_session_steps(user_id);
create index if not exists idx_user_session_steps_user_date on public.user_session_steps(user_id, session_date);
create index if not exists idx_user_session_steps_user_session_date on public.user_session_steps(user_id, session_id, session_date);

alter table public.user_session_steps enable row level security;

drop policy if exists "Users can read own session steps" on public.user_session_steps;
create policy "Users can read own session steps"
  on public.user_session_steps
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own session steps" on public.user_session_steps;
create policy "Users can insert own session steps"
  on public.user_session_steps
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own session steps" on public.user_session_steps;
create policy "Users can update own session steps"
  on public.user_session_steps
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own session steps" on public.user_session_steps;
create policy "Users can delete own session steps"
  on public.user_session_steps
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.user_session_steps to authenticated;

