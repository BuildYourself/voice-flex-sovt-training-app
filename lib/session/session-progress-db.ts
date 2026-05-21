"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserSessionStepRow {
  id: string;
  user_id: string;
  session_id: string;
  exercise_id: string;
  step_index: number;
  status: "completed" | string;
  duration_sec: number;
  completed_at: string;
  session_date: string;
  created_at: string;
  updated_at: string;
}

export interface CompletedSessionStepInput {
  userId: string;
  sessionId: string;
  sessionDate: string;
  exerciseId: string;
  stepIndex: number;
  durationSec: number;
  status?: "completed";
}

export async function getTodaySessionProgress({
  supabase,
  userId,
  sessionId,
  sessionDate
}: {
  supabase: SupabaseClient;
  userId: string;
  sessionId: string;
  sessionDate: string;
}) {
  const { data, error } = await supabase
    .from("user_session_steps")
    .select("*")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .eq("session_date", sessionDate)
    .order("step_index", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as UserSessionStepRow[];
}

export async function upsertCompletedSessionStep({
  supabase,
  userId,
  sessionId,
  sessionDate,
  exerciseId,
  stepIndex,
  durationSec,
  status = "completed"
}: {
  supabase: SupabaseClient;
} & CompletedSessionStepInput) {
  const payload = {
    user_id: userId,
    session_id: sessionId,
    exercise_id: exerciseId,
    step_index: stepIndex,
    status,
    duration_sec: durationSec,
    completed_at: new Date().toISOString(),
    session_date: sessionDate,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("user_session_steps").upsert(payload, {
    onConflict: "user_id,session_id,exercise_id,step_index,session_date"
  });

  if (error) {
    throw error;
  }
}

