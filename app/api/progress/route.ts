import { NextResponse } from "next/server";

import {
  calculatePracticeStreak,
  createVoiceFlexAdminClient,
  dateLabel,
  type DailyActivityRow,
  ensureOrderProgress,
  getLocalDateString,
  getServerEnvironment,
  resolveVerifiedOrder,
  secondsToClock,
  secondsToMinutes,
} from "@/lib/order-progress-server";
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
    const progress = await ensureOrderProgress(supabase, verified.order.id, productType);
    const session = getTrainingSessionConfig(productType);
    const today = getLocalDateString();

    const { data: activityRows, error: activityError } = await supabase
      .from("voiceflex_daily_activity")
      .select(
        "id, order_access_id, product_type, activity_date, program_day, completed_exercise_ids, completed_exercise_titles, seconds_practiced, full_session_completed, last_exercise_id, last_exercise_title, created_at, updated_at",
      )
      .eq("order_access_id", verified.order.id)
      .eq("product_type", productType)
      .order("activity_date", { ascending: false })
      .returns<DailyActivityRow[]>();

    if (activityError) {
      throw activityError;
    }

    const rows = activityRows ?? [];
    const activeRows = rows.filter((row) => (row.seconds_practiced ?? 0) > 0 || (row.completed_exercise_ids ?? []).length > 0);
    const practiceDates = activeRows.map((row) => row.activity_date);
    const practiceStreak = calculatePracticeStreak(practiceDates);
    const totalSeconds = rows.reduce((sum, row) => sum + (row.seconds_practiced ?? 0), 0);
    const exercisesCompleted = rows.reduce((sum, row) => sum + (row.completed_exercise_ids ?? []).length, 0);
    const fullSessions = rows.filter((row) => row.full_session_completed).length;
    const todayRow = rows.find((row) => row.activity_date === today);
    const todayCompletedIds = todayRow?.completed_exercise_ids ?? [];
    const todaySeconds = todayRow?.seconds_practiced ?? 0;
    const currentIndex = session.exercises.findIndex((exercise) => !todayCompletedIds.includes(exercise.id));
    const safeCurrentIndex = currentIndex === -1 ? session.exercises.length - 1 : currentIndex;
    const currentExercise = session.exercises[safeCurrentIndex];
    const sessionTotalSeconds = getSessionTotalSeconds(productType);
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
      currentDay: progress.current_day ?? session.day,
      stats: {
        practiceStreak,
        totalSeconds,
        totalMinutes: secondsToMinutes(totalSeconds),
        exercisesCompleted,
        fullSessions,
        lastPracticeDate: practiceDates.sort().at(-1) ?? null,
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
        activityByDate: Object.fromEntries(
          rows
            .filter((row) => monthKey(row.activity_date) === requestedMonth)
            .map((row) => [
              row.activity_date,
              {
                secondsPracticed: row.seconds_practiced ?? 0,
                completedCount: row.completed_exercise_ids?.length ?? 0,
                fullSessionCompleted: Boolean(row.full_session_completed),
              },
            ]),
        ),
      },
      milestones: [
        {
          title: "First Step",
          status: exercisesCompleted >= 1 ? "completed" : "locked",
          current: Math.min(exercisesCompleted, 1),
          target: 1,
        },
        {
          title: "First Session",
          status: fullSessions >= 1 ? "completed" : "locked",
          current: Math.min(fullSessions, 1),
          target: 1,
        },
        {
          title: "3 Practice Days",
          status: practiceDates.length >= 3 ? "completed" : "in-progress",
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
        label: `${dateLabel(row.activity_date)} • Day ${row.program_day ?? 1}`,
        subtitle: row.full_session_completed
          ? "Full session completed"
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
