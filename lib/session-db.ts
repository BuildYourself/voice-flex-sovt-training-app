"use server";

import { completeUserSession } from "@/lib/user-progress-db";

export async function completeUserSessionAction(input: { sessionName: string; totalMinutes: number; stepsCompleted: number }) {
  return completeUserSession(input);
}

