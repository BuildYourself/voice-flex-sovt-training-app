import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PROGRAM_DAY, DEFAULT_PROGRAM_SLUG, type DbExercise, type DbProgram, type DbProgramDay } from "@/lib/programs-db";

export interface UserProgressRow {
  user_id: string;
  current_program_id: string | null;
  current_day: number;
  day_streak: number;
  total_minutes: number;
  sessions_completed: number;
  last_session_date: string | null;
}

export interface UserSessionRow {
  id: string;
  user_id: string;
  program_id: string;
  program_day_id: string | null;
  session_name: string | null;
  completed_at: string;
  total_minutes: number | null;
  steps_completed: number | null;
}

export async function getCurrentUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user;
}

async function getDefaultProgramOrThrow() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs").select("*").eq("slug", DEFAULT_PROGRAM_SLUG).eq("is_published", true).maybeSingle();
  if (error || !data) throw new Error("Default program voice-flex-pro not found");
  return data as DbProgram;
}

export async function getOrCreateUserProgress() {
  const supabase = await createClient();
  const user = await getCurrentUserOrThrow();
  const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as UserProgressRow;

  const defaultProgram = await getDefaultProgramOrThrow();
  const { data: inserted, error: insertError } = await supabase
    .from("user_progress")
    .insert({
      user_id: user.id,
      current_program_id: defaultProgram.id,
      current_day: 1,
      day_streak: 0,
      total_minutes: 0,
      sessions_completed: 0
    })
    .select("*")
    .single();

  if (insertError) throw new Error(insertError.message);
  return inserted as UserProgressRow;
}

export async function getUserProgress() {
  return getOrCreateUserProgress();
}

export async function updateUserProgress(patch: Partial<UserProgressRow>) {
  const supabase = await createClient();
  const user = await getCurrentUserOrThrow();
  const { data, error } = await supabase
    .from("user_progress")
    .update({
      ...patch,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as UserProgressRow;
}

export async function getUserSessions(limit = 10) {
  const supabase = await createClient();
  const user = await getCurrentUserOrThrow();
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as UserSessionRow[];
}

async function getProgramById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as DbProgram | null;
}

async function getProgramDay(programId: string, dayNumber: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("program_days")
    .select("*")
    .eq("program_id", programId)
    .eq("day_number", dayNumber)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as DbProgramDay | null;
}

async function getExercisesForProgramDay(programDayId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("exercises").select("*").eq("program_day_id", programDayId).order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DbExercise[];
}

export async function getCurrentPlanForUser() {
  const progress = await getOrCreateUserProgress();
  const program = progress.current_program_id ? await getProgramById(progress.current_program_id) : await getDefaultProgramOrThrow();
  if (!program) {
    return { progress, program: null, day: null, exercises: [] as DbExercise[] };
  }

  const resolvedDayNumber = Math.max(DEFAULT_PROGRAM_DAY, progress.current_day || DEFAULT_PROGRAM_DAY);
  const day = (await getProgramDay(program.id, resolvedDayNumber)) ?? (await getProgramDay(program.id, DEFAULT_PROGRAM_DAY));
  if (!day) {
    return { progress, program, day: null, exercises: [] as DbExercise[] };
  }
  const exercises = await getExercisesForProgramDay(day.id);
  return { progress, program, day, exercises };
}

function isoDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function yesterdayIsoDateOnly(value: Date) {
  const next = new Date(value);
  next.setDate(next.getDate() - 1);
  return isoDateOnly(next);
}

export async function completeUserSession(input: { sessionName: string; totalMinutes: number; stepsCompleted: number }) {
  const supabase = await createClient();
  const user = await getCurrentUserOrThrow();
  const progress = await getOrCreateUserProgress();
  const program = progress.current_program_id ? await getProgramById(progress.current_program_id) : await getDefaultProgramOrThrow();
  if (!program) throw new Error("Current program not found");

  const activeDay = (await getProgramDay(program.id, progress.current_day || DEFAULT_PROGRAM_DAY)) ?? (await getProgramDay(program.id, DEFAULT_PROGRAM_DAY));
  if (!activeDay) throw new Error("Program day not found");

  const { error: insertError } = await supabase.from("user_sessions").insert({
    user_id: user.id,
    program_id: program.id,
    program_day_id: activeDay.id,
    session_name: input.sessionName,
    total_minutes: input.totalMinutes,
    steps_completed: input.stepsCompleted
  });
  if (insertError) throw new Error(insertError.message);

  const today = isoDateOnly(new Date());
  const yesterday = yesterdayIsoDateOnly(new Date());

  let nextStreak = progress.day_streak ?? 0;
  if (!progress.last_session_date) nextStreak = 1;
  else if (progress.last_session_date === today) nextStreak = progress.day_streak ?? 0;
  else if (progress.last_session_date === yesterday) nextStreak = (progress.day_streak ?? 0) + 1;
  else nextStreak = 1;

  const nextDay = Math.min(program.duration_days, Math.max(1, (progress.current_day || 1) + 1));
  const nextMinutes = Number(progress.total_minutes ?? 0) + input.totalMinutes;
  const nextSessions = (progress.sessions_completed ?? 0) + 1;

  const { data: updated, error: updateError } = await supabase
    .from("user_progress")
    .update({
      current_day: nextDay,
      day_streak: nextStreak,
      total_minutes: nextMinutes,
      sessions_completed: nextSessions,
      last_session_date: today,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) throw new Error(updateError.message);
  return updated as UserProgressRow;
}

