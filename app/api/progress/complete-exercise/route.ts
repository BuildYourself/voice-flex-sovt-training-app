import { NextResponse } from "next/server";

import {
  calculatePracticeStreak,
  createVoiceFlexAdminClient,
  type DailyActivityRow,
  ensureOrderProgress,
  getServerEnvironment,
  resolveVerifiedOrder,
} from "@/lib/order-progress-server";
import { isVoiceFlexProduct } from "@/lib/training-product";

export const runtime = "nodejs";

type CompleteExerciseRequest = {
  orderNumber?: unknown;
  productType?: unknown;
  programDay?: unknown;
  exerciseId?: unknown;
  exerciseTitle?: unknown;
  durationSeconds?: unknown;
  totalExercises?: unknown;
  practiceDate?: unknown;
};

const ERROR_RESPONSE = {
  ok: false,
  status: "server_error",
  message: "We couldn’t save your progress right now. Your local session can continue.",
} as const;

function toPositiveNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CompleteExerciseRequest;
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const productType = isVoiceFlexProduct(body.productType) ? body.productType : null;
    const programDay = toPositiveNumber(body.programDay);
    const exerciseId = typeof body.exerciseId === "string" ? body.exerciseId.trim() : "";
    const exerciseTitle = typeof body.exerciseTitle === "string" ? body.exerciseTitle.trim() : "";
    const durationSeconds = toPositiveNumber(body.durationSeconds);
    const totalExercises = toPositiveNumber(body.totalExercises);
    const practiceDate = isDateString(body.practiceDate) ? body.practiceDate : null;

    if (!orderNumber || !productType || !programDay || !exerciseId || !exerciseTitle || !durationSeconds || !totalExercises || !practiceDate) {
      return NextResponse.json(
        {
          ok: false,
          status: "bad_request",
          message: "Missing progress data.",
        },
        { status: 400 },
      );
    }

    const env = getServerEnvironment();
    if (!env) {
      console.error("[progress/complete-exercise] Missing required server environment configuration.");
      return NextResponse.json(ERROR_RESPONSE, { status: 500 });
    }

    const supabase = createVoiceFlexAdminClient(env);
    const verified = await resolveVerifiedOrder(supabase, env, orderNumber, productType);

    if (!verified.ok) {
      return NextResponse.json(verified, { status: verified.status === "not_found" ? 404 : 403 });
    }

    await ensureOrderProgress(supabase, verified.order.id, productType);

    const { data: existing, error: selectActivityError } = await supabase
      .from("voiceflex_daily_activity")
      .select(
        "id, order_access_id, product_type, activity_date, program_day, completed_exercise_ids, completed_exercise_titles, seconds_practiced, full_session_completed, last_exercise_id, last_exercise_title, created_at, updated_at",
      )
      .eq("order_access_id", verified.order.id)
      .eq("product_type", productType)
      .eq("activity_date", practiceDate)
      .eq("program_day", programDay)
      .maybeSingle<DailyActivityRow>();

    if (selectActivityError) {
      throw selectActivityError;
    }

    const currentIds = existing?.completed_exercise_ids ?? [];
    const currentTitles = existing?.completed_exercise_titles ?? [];
    const alreadyCompleted = currentIds.includes(exerciseId);
    const nextIds = alreadyCompleted ? currentIds : uniqueStrings([...currentIds, exerciseId]);
    const nextTitles = alreadyCompleted ? currentTitles : uniqueStrings([...currentTitles, exerciseTitle]);
    const nextSeconds = alreadyCompleted ? existing?.seconds_practiced ?? 0 : (existing?.seconds_practiced ?? 0) + durationSeconds;
    const fullSessionCompleted = nextIds.length >= totalExercises;

    if (existing?.id) {
      const { error: updateActivityError } = await supabase
        .from("voiceflex_daily_activity")
        .update({
          completed_exercise_ids: nextIds,
          completed_exercise_titles: nextTitles,
          seconds_practiced: nextSeconds,
          full_session_completed: fullSessionCompleted,
          last_exercise_id: exerciseId,
          last_exercise_title: exerciseTitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateActivityError) {
        throw updateActivityError;
      }
    } else {
      const { error: insertActivityError } = await supabase.from("voiceflex_daily_activity").insert({
        order_access_id: verified.order.id,
        product_type: productType,
        activity_date: practiceDate,
        program_day: programDay,
        completed_exercise_ids: nextIds,
        completed_exercise_titles: nextTitles,
        seconds_practiced: nextSeconds,
        full_session_completed: fullSessionCompleted,
        last_exercise_id: exerciseId,
        last_exercise_title: exerciseTitle,
      });

      if (insertActivityError) {
        throw insertActivityError;
      }
    }

    const { data: allRows, error: allRowsError } = await supabase
      .from("voiceflex_daily_activity")
      .select("activity_date, completed_exercise_ids, seconds_practiced, full_session_completed")
      .eq("order_access_id", verified.order.id)
      .eq("product_type", productType)
      .returns<Pick<DailyActivityRow, "activity_date" | "completed_exercise_ids" | "seconds_practiced" | "full_session_completed">[]>();

    if (allRowsError) {
      throw allRowsError;
    }

    const practiceDates = (allRows ?? [])
      .filter((row) => (row.seconds_practiced ?? 0) > 0 || (row.completed_exercise_ids ?? []).length > 0)
      .map((row) => row.activity_date);
    const totalSeconds = (allRows ?? []).reduce((sum, row) => sum + (row.seconds_practiced ?? 0), 0);
    const exercisesCompleted = (allRows ?? []).reduce((sum, row) => sum + (row.completed_exercise_ids ?? []).length, 0);
    const fullSessions = (allRows ?? []).filter((row) => row.full_session_completed).length;
    const lastPracticeDate = practiceDates.sort().at(-1) ?? null;
    const practiceStreak = calculatePracticeStreak(practiceDates);

    const { error: updateProgressError } = await supabase
      .from("voiceflex_order_progress")
      .update({
        practice_streak: practiceStreak,
        total_seconds: totalSeconds,
        exercises_completed_count: exercisesCompleted,
        full_sessions_completed: fullSessions,
        last_practice_date: lastPracticeDate,
        updated_at: new Date().toISOString(),
      })
      .eq("order_access_id", verified.order.id)
      .eq("product_type", productType);

    if (updateProgressError) {
      throw updateProgressError;
    }

    return NextResponse.json({
      ok: true,
      status: "completed",
      alreadyCompleted,
      today: {
        activityDate: practiceDate,
        completedExerciseIds: nextIds,
        secondsPracticed: nextSeconds,
        fullSessionCompleted,
      },
      stats: {
        practiceStreak,
        totalSeconds,
        exercisesCompleted,
        fullSessions,
        lastPracticeDate,
      },
    });
  } catch (error) {
    console.error("[progress/complete-exercise] Failed to save completed exercise.", error);
    return NextResponse.json(ERROR_RESPONSE, { status: 500 });
  }
}
