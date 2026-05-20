create extension if not exists pgcrypto;

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  duration_days int not null default 1,
  difficulty text not null default 'Easy',
  color_theme text not null default 'blue',
  icon text,
  is_featured boolean default false,
  is_published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade,
  day_number int not null,
  title text not null,
  description text,
  estimated_minutes numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (program_id, day_number)
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid references public.program_days(id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  duration_seconds int not null,
  display_duration text,
  tool text,
  instruction text,
  what_to_do_now text,
  how_it_should_feel jsonb default '[]'::jsonb,
  common_mistakes jsonb default '[]'::jsonb,
  safety_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.programs enable row level security;
alter table public.program_days enable row level security;
alter table public.exercises enable row level security;

drop policy if exists "Authenticated can read published programs" on public.programs;
create policy "Authenticated can read published programs"
  on public.programs
  for select
  to authenticated
  using (is_published = true);

drop policy if exists "Authenticated can read days for published programs" on public.program_days;
create policy "Authenticated can read days for published programs"
  on public.program_days
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.programs p
      where p.id = program_days.program_id
        and p.is_published = true
    )
  );

drop policy if exists "Authenticated can read exercises for published programs" on public.exercises;
create policy "Authenticated can read exercises for published programs"
  on public.exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.program_days pd
      join public.programs p on p.id = pd.program_id
      where pd.id = exercises.program_day_id
        and p.is_published = true
    )
  );

insert into public.programs (
  title, slug, description, duration_days, difficulty, color_theme, icon, is_featured, sort_order
)
values
  ('Beginner Singer', 'beginner-singer', 'Build strong foundations', 21, 'Easy', 'purple', 'microphone', false, 1),
  ('Daily Warm-Up', 'daily-warm-up', 'Activate & prepare your voice', 10, 'Easy', 'green', 'waves', false, 2),
  ('Voice Recovery', 'voice-recovery', 'Restore, heal & rebuild strength', 14, 'Easy', 'pink', 'heart', false, 3),
  ('Speaking Voice', 'speaking-voice', 'Speak clearly & confidently', 7, 'Easy', 'blue', 'message-circle', false, 4),
  ('Range Builder', 'range-builder', 'Expand range safely & smoothly', 21, 'Medium', 'yellow', 'trophy', false, 5),
  ('21-Day Transformation', 'transformation-21', 'Complete system. Total transformation.', 21, 'Medium', 'navy', 'shield-check', true, 6),
  ('Voice Flex Pro', 'voice-flex-pro', 'Professional SOVT routine for control, range, and vocal ease.', 21, 'Medium', 'navy', 'waves', true, 0)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  duration_days = excluded.duration_days,
  difficulty = excluded.difficulty,
  color_theme = excluded.color_theme,
  icon = excluded.icon,
  is_featured = excluded.is_featured,
  is_published = true,
  sort_order = excluded.sort_order,
  updated_at = now();

with target_program as (
  select id from public.programs where slug = 'voice-flex-pro'
), removed as (
  delete from public.exercises e
  using public.program_days pd, target_program tp
  where e.program_day_id = pd.id
    and pd.program_id = tp.id
    and pd.day_number = 1
  returning e.id
)
delete from public.program_days pd
using target_program tp
where pd.program_id = tp.id
  and pd.day_number = 1;

insert into public.program_days (
  program_id, day_number, title, description, estimated_minutes
)
select
  p.id,
  1,
  'Voice Flex Pro — Professional SOVT Routine',
  '10-minute SOVT routine for control, range, and vocal ease.',
  10.5
from public.programs p
where p.slug = 'voice-flex-pro'
on conflict (program_id, day_number) do update set
  title = excluded.title,
  description = excluded.description,
  estimated_minutes = excluded.estimated_minutes,
  updated_at = now();

insert into public.exercises (
  program_day_id, sort_order, title, duration_seconds, display_duration, tool, instruction, what_to_do_now, how_it_should_feel, common_mistakes, safety_note
)
select pd.id, x.sort_order, x.title, x.duration_seconds, x.display_duration, x.tool, x.instruction, x.what_to_do_now, x.how_it_should_feel::jsonb, x.common_mistakes::jsonb, x.safety_note
from public.program_days pd
join public.programs p on p.id = pd.program_id
join (
  values
    (1, 'Easy Bubbles', 60, '1 min', 'Yellow 10mm Straw + Water Cup', 'Place the yellow 10mm straw into the water. Seal your lips gently around the straw. Blow softly and create small, steady bubbles. Keep your shoulders, jaw, tongue, and throat relaxed.', 'Keep the bubbles small and steady. Stay relaxed.', '["Light resistance","Steady bubbles","No throat pressure","No pushing"]', '["Blowing too hard","Making large splashing bubbles","Tensing jaw or neck","Running out of air too quickly"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.'),
    (2, 'Soft “mmm”', 60, '1 min', 'Yellow 10mm Straw + Water Cup', 'Keep the yellow 10mm straw in the water. Start with small, steady bubbles, then add a soft “mmm” sound through the straw. Keep everything gentle and relaxed.', 'Start the same steady bubbles, then add a soft “mmm”.', '["Gentle vibration","Relaxed throat","Stable bubbling","Voice turns on without effort"]', '["Getting louder to hear yourself","Forcing the sound","Letting air escape through the lips","Feeling scratchiness or discomfort"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.'),
    (3, 'Siren', 120, '2 min', 'Metal 3mm Straw', 'Switch to the thinner 3mm metal straw. Perform wide, controlled sirens through your vocal range, from your lowest comfortable note to your highest comfortable note and back. Focus on smooth transitions between registers.', 'Glide slowly up and down with steady airflow.', '["Smooth glide","No break or flip","No throat squeeze","Easy movement from low to high and back"]', '["Jumping too fast","Forcing high notes","Letting the voice crack hard","Pushing extra air at the top"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.'),
    (4, '5 Notes', 120, '2 min', 'Metal 3mm Straw', 'Sing five neighboring notes through the straw. Example: C-D-E-F-G, then G-F-E-D-C. Keep every note clean and even. Repeat from slightly different starting pitches.', 'Move through five notes slowly and evenly.', '["Precise but relaxed","Even airflow","Clean note changes","No jaw or tongue tension"]', '["Rushing the notes","Losing airflow between notes","Over-controlling the throat","Letting pitch wobble"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.'),
    (5, 'Arpeggio', 120, '2 min', 'Metal 3mm Straw', 'Sing a simple triad through the straw. Example: C-E-G-C, then C-G-E-C. Use one smooth breath. Repeat 6 times, starting slightly higher each time. Focus on precision and smoothness.', 'Keep each note connected and light.', '["Light and accurate","Connected notes","No strain at the top","Stable breath"]', '["Getting louder as notes rise","Holding tension in the tongue","Running out of air too early","Pushing instead of gliding"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.'),
    (6, '2 Notes', 90, '1.5 min', 'Metal 3mm or Silicone 5mm Straw', 'Choose one lower note and one clearly higher note. Move between them: low-high-low-high. Keep both notes stable and clean. Make the jump precise, not forced.', 'Jump between two notes with clean, steady airflow.', '["Clear contrast between notes","Easy jump","No throat grab","Air stays steady"]', '["Attacking the higher note too hard","Letting the low note collapse","Pushing air to reach the high note","Feeling scratchiness"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.'),
    (7, 'Voice Check', 60, '1 min', 'No Straw', 'Remove the straw. Sing or speak a short phrase gently. Try to keep the same easy, balanced feeling. Notice whether your voice feels freer, clearer, or more stable.', 'Compare your voice after the straw work.', '["Voice feels easier","Tone feels more connected","Less air leakage","Less effort"]', '["Immediately singing too loudly","Forgetting the easy airflow feeling","Trying to perform instead of observe"]', 'If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.')
) as x(sort_order, title, duration_seconds, display_duration, tool, instruction, what_to_do_now, how_it_should_feel, common_mistakes, safety_note)
  on true
where p.slug = 'voice-flex-pro'
  and pd.day_number = 1;

