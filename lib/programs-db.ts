export const DEFAULT_PROGRAM_SLUG = "voice-flex-pro";
export const DEFAULT_PROGRAM_DAY = 1;
export const SELECTED_PROGRAM_KEY = "voiceflex_selected_program_slug";

export interface DbProgram {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_days: number;
  difficulty: string;
  color_theme: string;
  icon: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

export interface DbProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
}

export interface DbExercise {
  id: string;
  program_day_id: string;
  sort_order: number;
  title: string;
  duration_seconds: number;
  display_duration: string | null;
  tool: string | null;
  instruction: string | null;
  what_to_do_now: string | null;
  how_it_should_feel: string[];
  common_mistakes: string[];
  safety_note: string | null;
}

export interface ProgramsDebugError {
  scope: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface TodayPlanResult {
  program: DbProgram | null;
  day: DbProgramDay | null;
  exercises: DbExercise[];
  selectedSlug: string;
  error: ProgramsDebugError | null;
}

function normalizeExercise(exercise: any): DbExercise {
  return {
    ...exercise,
    how_it_should_feel: Array.isArray(exercise.how_it_should_feel) ? exercise.how_it_should_feel : [],
    common_mistakes: Array.isArray(exercise.common_mistakes) ? exercise.common_mistakes : []
  };
}

function toDebugError(scope: string, error: any): ProgramsDebugError {
  return {
    scope,
    message: error?.message ?? "Unknown Supabase error",
    code: error?.code,
    details: error?.details,
    hint: error?.hint
  };
}

export async function getPublishedPrograms() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  if (process.env.NODE_ENV !== "production") {
    console.log("[programs-db] SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  }

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    const parsed = toDebugError("getPublishedPrograms", error);
    console.error("[programs-db] programs query error:", parsed);
    throw new Error(`[${parsed.scope}] ${parsed.message} (${parsed.code ?? "no-code"})`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[programs-db] programs rows:", data?.length ?? 0);
  }

  return (data ?? []) as DbProgram[];
}

export async function getProgramBySlug(slug: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();

  if (error) {
    const parsed = toDebugError("getProgramBySlug", error);
    console.error("[programs-db] program by slug error:", { slug, ...parsed });
    throw new Error(`[${parsed.scope}] ${parsed.message} (${parsed.code ?? "no-code"})`);
  }

  return (data ?? null) as DbProgram | null;
}

export async function getDefaultProgram() {
  const program = await getProgramBySlug(DEFAULT_PROGRAM_SLUG);
  if (program) return program;
  const all = await getPublishedPrograms();
  return all[0] ?? null;
}

export async function getProgramDayByProgramId(programId: string, dayNumber: number) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase.from("program_days").select("*").eq("program_id", programId).eq("day_number", dayNumber).maybeSingle();

  if (error) {
    const parsed = toDebugError("getProgramDayByProgramId", error);
    console.error("[programs-db] program day error:", { programId, dayNumber, ...parsed });
    throw new Error(`[${parsed.scope}] ${parsed.message} (${parsed.code ?? "no-code"})`);
  }

  return (data ?? null) as DbProgramDay | null;
}

export async function getExercisesForProgramDayId(programDayId: string) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase.from("exercises").select("*").eq("program_day_id", programDayId).order("sort_order", { ascending: true });

  if (error) {
    const parsed = toDebugError("getExercisesForProgramDayId", error);
    console.error("[programs-db] exercises error:", { programDayId, ...parsed });
    throw new Error(`[${parsed.scope}] ${parsed.message} (${parsed.code ?? "no-code"})`);
  }

  return (data ?? []).map(normalizeExercise);
}

export async function getTodayPlanBySlug(preferredSlug: string, dayNumber = DEFAULT_PROGRAM_DAY): Promise<TodayPlanResult> {
  try {
    const selectedSlug = preferredSlug || DEFAULT_PROGRAM_SLUG;
    const program = (await getProgramBySlug(selectedSlug)) ?? (await getDefaultProgram());

    if (!program) {
      return {
        program: null,
        day: null,
        exercises: [],
        selectedSlug,
        error: null
      };
    }

    const day = await getProgramDayByProgramId(program.id, dayNumber);
    if (!day) {
      return {
        program,
        day: null,
        exercises: [],
        selectedSlug: program.slug,
        error: null
      };
    }

    const exercises = await getExercisesForProgramDayId(day.id);

    if (process.env.NODE_ENV !== "production") {
      console.log("[programs-db] today plan debug:", {
        selectedSlug,
        queriedSlug: program.slug,
        programDayRows: day ? 1 : 0,
        exerciseRows: exercises.length
      });
    }

    return {
      program,
      day,
      exercises,
      selectedSlug: program.slug,
      error: null
    };
  } catch (error: any) {
    const parsed = toDebugError("getTodayPlanBySlug", error);
    console.error("[programs-db] today plan fatal:", parsed);
    return {
      program: null,
      day: null,
      exercises: [],
      selectedSlug: preferredSlug || DEFAULT_PROGRAM_SLUG,
      error: parsed
    };
  }
}

export async function getTodayPlan() {
  return getTodayPlanBySlug(DEFAULT_PROGRAM_SLUG, DEFAULT_PROGRAM_DAY);
}

