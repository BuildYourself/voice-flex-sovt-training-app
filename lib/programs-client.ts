"use client";

import { createClient } from "@/lib/supabase/client";
export const DEFAULT_PROGRAM_SLUG = "voice-flex-pro";
export const DEFAULT_PROGRAM_DAY = 1;

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

export const SELECTED_PROGRAM_KEY = "voiceflex_selected_program_slug";

function normalizeExercise(exercise: any): DbExercise {
  return {
    ...exercise,
    how_it_should_feel: Array.isArray(exercise.how_it_should_feel) ? exercise.how_it_should_feel : [],
    common_mistakes: Array.isArray(exercise.common_mistakes) ? exercise.common_mistakes : []
  };
}

function logDebug(label: string, payload: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[programs-client] ${label}`, payload);
  }
}

export function getSelectedProgramSlugFromStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_PROGRAM_KEY);
}

export function setSelectedProgramSlugToStorage(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_PROGRAM_KEY, slug);
}

export async function resolveValidSelectedSlug() {
  const supabase = createClient();
  const selected = getSelectedProgramSlugFromStorage();
  const fallback = DEFAULT_PROGRAM_SLUG;

  logDebug("supabaseUrl", process.env.NEXT_PUBLIC_SUPABASE_URL);
  logDebug("selectedSlugLocalStorage", selected);

  if (!selected) return fallback;

  const { data, error } = await supabase
    .from("programs")
    .select("slug")
    .eq("slug", selected)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    logDebug("selectedSlugValidationError", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return fallback;
  }

  return data?.slug ?? fallback;
}

export async function getClientProgramPlan(programSlug: string, dayNumber = DEFAULT_PROGRAM_DAY) {
  const supabase = createClient();

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", programSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (programError) {
    return {
      program: null as DbProgram | null,
      day: null as DbProgramDay | null,
      exercises: [] as DbExercise[],
      error: `[program] ${programError.message}`
    };
  }

  if (!program) {
    return {
      program: null as DbProgram | null,
      day: null as DbProgramDay | null,
      exercises: [] as DbExercise[],
      error: null
    };
  }

  const { data: day, error: dayError } = await supabase
    .from("program_days")
    .select("*")
    .eq("program_id", program.id)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (dayError) {
    return {
      program: program as DbProgram,
      day: null as DbProgramDay | null,
      exercises: [] as DbExercise[],
      error: `[program_day] ${dayError.message}`
    };
  }

  if (!day) {
    return {
      program: program as DbProgram,
      day: null as DbProgramDay | null,
      exercises: [] as DbExercise[],
      error: null
    };
  }

  const { data: exercisesRaw, error: exercisesError } = await supabase
    .from("exercises")
    .select("*")
    .eq("program_day_id", day.id)
    .order("sort_order", { ascending: true });

  if (exercisesError) {
    return {
      program: program as DbProgram,
      day: day as DbProgramDay,
      exercises: [] as DbExercise[],
      error: `[exercises] ${exercisesError.message}`
    };
  }

  const exercises = (exercisesRaw ?? []).map(normalizeExercise);

  logDebug("planRows", {
    selectedSlug: programSlug,
    queriedSlug: (program as DbProgram).slug,
    programRows: program ? 1 : 0,
    dayRows: day ? 1 : 0,
    exerciseRows: exercises.length
  });

  return {
    program: program as DbProgram,
    day: day as DbProgramDay,
    exercises,
    error: null as string | null
  };
}
