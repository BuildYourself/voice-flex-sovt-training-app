import { NextResponse } from "next/server";

import {
  createVoiceFlexAdminClient,
  dateLabel,
  type DailyActivityRow,
  ensureOrderProgress,
  getLocalDateString,
  getServerEnvironment,
  PROFILE_NOT_FOUND,
  requestProfileSlot,
  resolveVerifiedOrder,
  secondsToClock,
  secondsToMinutes,
} from "@/lib/order-progress-server";
import { getKitProfile } from "@/lib/kits";
import { getRoutineBySlot } from "@/lib/routines";
import { isVoiceFlexProduct } from "@/lib/training-product";
import {
  formatSessionDuration,
  getSessionTotalSeconds,
  getTrainingSessionConfig,
} from "@/lib/training-sessions";

export const runtime = "nodejs";

type ProgressRequest = {
  orderNumber?: unknown;
  productType?: unknown;
  month?: unknown;
  /** The user's local date (YYYY-MM-DD). The server clock is UTC. */
  today?: unknown;
  /** Which person on a multi-unit order (1 = first). */
  profileSlot?: unknown;
};

const ERROR_RESPONSE = {
  ok: false,
  status: "server_error",
  message: "We couldn’t load your progress right now. Please try again later.",
} as const;

function monthKey(dateString: string) {
  return dateString.slice(0, 7);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ProgressRequest;
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const expectedProductType = isVoiceFlexProduct(body.productType) ? body.productType : undefined;
    const requestedMonth =
      typeof body.month === "string" && /^\d{4}-\d{2}$/.test(body.month)
        ? body.month
        : monthKey(getLocalDateString());

    if (!orderNumber) {
      return NextResponse.json(
        {
          ok: false,
          status: "missing_order_number",
          message: "Enter your Amazon order number to continue.",
        },
        { status: 400 },
      );
    }

    const env = getServerEnvironment();
    if (!env) {
      console.error("[progress] Missing required server environment configuration.");
      return NextResponse.json(ERROR_RESPONSE, { status: 500 });
    }

    const supabase = createVoiceFlexAdminClient(env);
    const verified = await resolveVerifiedOrder(supabase, env, orderNumber, expectedProductType);

    if (!verified.ok) {
      return NextResponse.json(verified, { status: verified.status === "not_found" ? 404 : 403 });
    }

    const productType = verified.product.productType;
    const profileSlot = requestProfileSlot(body.profileSlot, verified.seats);
    if (!profileSlot) {
      return NextResponse.json(PROFILE_NOT_FOUND, { status: 403 });
    }
    const progress = await ensureOrderProgress(supabase, verified.order.id, productType, profileSlot);
    const kit = verified.kit;
    const session = getTrainingSessionConfig(productType, kit, "daily");
    const today =
      typeof body.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : getLocalDateString();

    const { data: activityRows, error: activityError } = await supabase
      .from("voiceflex_daily_activity")
      .select(
        "id, order_access_id, product_type, activity_date, program_day, completed_exercise_ids, completed_exercise_titles, seconds_practiced, full_session_completed, last_exercise_id, last_exercise_title, created_at, updated_at",
      )
      .eq("order_access_id", verified.order.id)
      .eq("product_type", productType)
      .eq("profile_slot", profileSlot)
      .order("activity_date", { ascending: false })
      .returns<DailyActivityRow[]>();

    if (activityError) {
      throw activityError;
    }

    const rows = activityRows ?? [];
    const activeRows = rows.filter((row) => (row.seconds_practiced ?? 0) > 0 || (row.completed_exercise_ids ?? []).length > 0);
    const practiceDates = activeRows.map((row) => row.activity_date);
    const practiceStreak = progress.practice_streak ?? 0;
    const totalSeconds = progress.total_seconds ?? 0;
    const exercisesCompleted = progress.exercises_completed_count ?? 0;
    const fullSessions = progress.full_sessions_completed ?? 0;
    const lastPracticeDate = progress.last_practice_date ?? null;
    // program_day holds the routine slot. Slot 1 is the Daily Session.
    const todayRow = rows.find((row) => row.activity_date === today && (row.program_day ?? 1) === 1);
    const todayRoutines = rows
      .filter((row) => row.activity_date === today)
      .map((row) => {
        const routine = getRoutineBySlot(row.program_day);
        return {
          routineId: routine.id,
          title: routine.title,
          completedCount: row.completed_exercise_ids?.length ?? 0,
          fullSessionCompleted: Boolean(row.full_session_completed),
          secondsPracticed: row.seconds_practiced ?? 0,
        };
      });
    const calendarByDate: Record<string, { secondsPracticed: number; completedCount: number; fullSessionCompleted: boolean; routines: string[] }> = {};
    rows
      .filter((row) => monthKey(row.activity_date) === requestedMonth)
      .forEach((row) => {
        const entry = (calendarByDate[row.activity_date] ??= {
          secondsPracticed: 0,
          completedCount: 0,
          fullSessionCompleted: false,
          routines: [],
        });
        entry.secondsPracticed += row.seconds_practiced ?? 0;
        entry.completedCount += row.completed_exercise_ids?.length ?? 0;
        entry.fullSessionCompleted = entry.fullSessionCompleted || Boolean(row.full_session_completed);
        if (row.full_session_completed) entry.routines.push(getRoutineBySlot(row.program_day).title);
      });
    const todayCompletedIds = todayRow?.completed_exercise_ids ?? [];
    const todaySeconds = todayRow?.seconds_practiced ?? 0;
    const currentIndex = session.exercises.findIndex((exercise) => !todayCompletedIds.includes(exercise.id));
    const safeCurrentIndex = currentIndex === -1 ? session.exercises.length - 1 : currentIndex;
    const currentExercise = session.exercises[safeCurrentIndex];
    const sessionTotalSeconds = getSessionTotalSeconds(productType, kit, "daily");
    const todayPercent = session.exercises.length
      ? Math.round((todayCompletedIds.length / session.exercises.length) * 100)
      : 0;

    return NextResponse.json({
      ok: true,
      status: "loaded",
      orderAccessId: verified.order.id,
      orderNumber: verified.order.amazon_order_number,
      productType,
      productName: verified.product.productName,
      kit,
      kitName: getKitProfile(kit).name,
      sourceAsin: verified.sourceAsin,
      // Kept for older clients. The app no longer shows program days.
      currentDay: progress.current_day ?? 1,
      stats: {
        practiceStreak,
        totalSeconds,
        totalMinutes: secondsToMinutes(totalSeconds),
        exercisesCompleted,
        fullSessions,
        lastPracticeDate,
      },
      today: {
        activityDate: today,
        completedExerciseIds: todayCompletedIds,
        completedExerciseTitles: todayRow?.completed_exercise_titles ?? [],
        completedCount: todayCompletedIds.length,
        totalExercises: session.exercises.length,
        percent: todayPercent,
        secondsPracticed: todaySeconds,
        displayPracticed: secondsToClock(todaySeconds),
        currentExerciseId: currentExercise?.id ?? null,
        currentExerciseTitle: currentExercise?.title ?? null,
        routines: todayRoutines,
      },
      session: {
        totalSeconds: sessionTotalSeconds,
        totalMinutes: secondsToMinutes(sessionTotalSeconds),
        exercises: session.exercises.map((exercise, index) => ({
          id: exercise.id,
          title: exercise.title,
          durationSeconds: exercise.durationSeconds,
          displayDuration: formatSessionDuration(exercise.durationSeconds),
          status: todayCompletedIds.includes(exercise.id)
            ? "completed"
            : index === safeCurrentIndex
              ? "current"
              : "upcoming",
        })),
      },
      calendar: {
        month: requestedMonth,
        activityByDate: calendarByDate,
      },
      milestones: [
        {
          title: "First Step",
          status: exercisesCompleted >= 1 ? "completed" : "locked",
          current: Math.min(exercisesCompleted, 1),
          target: 1,
        },
        {
          title: "First Full Routine",
          status: fullSessions >= 1 ? "completed" : "locked",
          current: Math.min(fullSessions, 1),
          target: 1,
        },
        {
          title: "3 Practice Days",
          status: new Set(practiceDates).size >= 3 ? "completed" : "in-progress",
          current: Math.min(new Set(practiceDates).size, 3),
          target: 3,
        },
        {
          title: "30 Minutes",
          status: totalSeconds >= 1800 ? "completed" : "locked",
          current: Math.min(secondsToMinutes(totalSeconds), 30),
          target: 30,
        },
      ],
      recentActivity: rows.slice(0, 5).map((row) => ({
        date: row.activity_date,
        label: `${dateLabel(row.activity_date)} • ${getRoutineBySlot(row.program_day).title}`,
        subtitle: row.full_session_completed
          ? "Routine completed"
          : `${row.completed_exercise_ids?.length ?? 0} exercises completed`,
        secondsPracticed: row.seconds_practiced ?? 0,
        displayDuration: row.seconds_practiced ? secondsToClock(row.seconds_practiced) : "—",
        status: row.full_session_completed ? "full" : "partial",
      })),
    });
  } catch (error) {
    console.error("[progress] Failed to load progress dashboard.", error);
    return NextResponse.json(ERROR_RESPONSE, { status: 500 });
  }
}
