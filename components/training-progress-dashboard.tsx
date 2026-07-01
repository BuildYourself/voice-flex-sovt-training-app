"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Flame,
  Flag,
  Lock,
  Play,
  RotateCcw,
  Star,
  Timer,
  Trash2,
  Trophy,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VoiceFlexProduct } from "@/lib/training-product";
import { trainingProgressStore } from "@/lib/training-progress";

const VERIFIED_ORDER_NUMBER_KEY = "voiceflex_verified_order_number";

type ProgressExercise = {
  id: string;
  title: string;
  durationSeconds: number;
  displayDuration: string;
  status: "completed" | "current" | "upcoming";
};

type ProgressMilestone = {
  title: string;
  status: "completed" | "in-progress" | "locked";
  current: number;
  target: number;
};

type RecentActivity = {
  date: string;
  label: string;
  subtitle: string;
  secondsPracticed: number;
  displayDuration: string;
  status: "full" | "partial";
};

type ProgressPayload = {
  ok: true;
  productType: VoiceFlexProduct;
  productName: string;
  currentDay: number;
  stats: {
    practiceStreak: number;
    totalSeconds: number;
    totalMinutes: number;
    exercisesCompleted: number;
    fullSessions: number;
  };
  today: {
    completedCount: number;
    totalExercises: number;
    percent: number;
    secondsPracticed: number;
    displayPracticed: string;
    currentExerciseTitle: string | null;
  };
  session: {
    totalSeconds: number;
    totalMinutes: number;
    exercises: ProgressExercise[];
  };
  calendar: {
    month: string;
    activityByDate: Record<
      string,
      {
        secondsPracticed: number;
        completedCount: number;
        fullSessionCompleted: boolean;
      }
    >;
  };
  milestones: ProgressMilestone[];
  recentActivity: RecentActivity[];
};

type ProgressErrorPayload = {
  ok: false;
  message: string;
};

function isProgressPayload(value: unknown): value is ProgressPayload {
  return Boolean(value && typeof value === "object" && (value as { ok?: unknown }).ok === true);
}

function productLabel(productType: VoiceFlexProduct) {
  return productType === "go" ? "Voice Flex GO" : "Voice Flex Pro";
}

function getMonthDays(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const daysInMonth = new Date(year, monthIndex, 0).getDate();
  const leading = first.getDay();
  const previousMonthDays = new Date(year, monthIndex - 1, 0).getDate();
  const cells: { day: number; date: string; inMonth: boolean }[] = [];

  for (let index = leading - 1; index >= 0; index -= 1) {
    const day = previousMonthDays - index;
    cells.push({ day, date: "", inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: `${year}-${String(monthIndex).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, date: "", inMonth: false });
  }

  return cells;
}

function monthTitle(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex - 1, 1),
  );
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function ProgressSidebar({ productType }: { productType: VoiceFlexProduct }) {
  function restartSetup() {
    trainingProgressStore.updateProgress(productType, { onboardingCompleted: false });
    window.location.href = `/train/${productType}`;
  }

  function resetLocalProgress() {
    trainingProgressStore.resetProgress(productType);
    window.location.reload();
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[272px] bg-navy-950 px-5 py-8 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 text-2xl font-black">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-300">
          <Waves className="h-7 w-7" />
        </span>
        Voice Flex
      </div>

      <nav className="mt-10 space-y-2">
        <Link className="block rounded-2xl px-4 py-4 font-bold text-white/75 hover:bg-white/10" href={`/train/${productType}`}>
          Setup
        </Link>
        <Link className="block rounded-2xl px-4 py-4 font-bold text-white/75 hover:bg-white/10" href={`/train/${productType}`}>
          Sessions
        </Link>
        <div className="rounded-2xl bg-electric-600 px-4 py-4 font-black">Progress</div>
        <div className="rounded-2xl px-4 py-4 font-bold text-white/75">Settings</div>
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/75">
        <p className="font-black text-white">{productLabel(productType)}</p>
        <p className="mt-2">No account required. Progress saved on this device.</p>
        <div className="mt-4 grid gap-2">
          <button className="rounded-xl border border-white/15 px-3 py-2 text-left text-xs font-black text-white/85 hover:bg-white/10" type="button" onClick={restartSetup}>
            <RotateCcw className="mr-2 inline h-3.5 w-3.5" />
            Restart setup
          </button>
          <button className="rounded-xl border border-white/15 px-3 py-2 text-left text-xs font-black text-white/85 hover:bg-white/10" type="button" onClick={resetLocalProgress}>
            <Trash2 className="mr-2 inline h-3.5 w-3.5" />
            Reset local progress
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopMetric({ icon, value, label }: { icon: "fire" | "timer"; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{icon === "fire" ? "🔥" : "⏱️"}</span>
      <span>
        <span className="block text-lg font-black text-black">{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </span>
    </div>
  );
}

function StatCard({ Icon, label, value, suffix }: { Icon: LucideIcon; label: string; value: string | number; suffix?: string }) {
  return (
    <div className="flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-electric-700">
        <Icon className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-1 text-4xl font-black tracking-tight text-black">
          {value}
          {suffix ? <span className="ml-1 text-xl">{suffix}</span> : null}
        </p>
      </div>
    </div>
  );
}

function TodayProgressCard({ data, productType }: { data: ProgressPayload; productType: VoiceFlexProduct }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-9 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-black">Today&apos;s Progress</h2>
              <p className="mt-2 text-base text-slate-600">
                {productLabel(productType)} <span className="px-2">•</span> Day {data.currentDay}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-16">
              <p className="text-slate-600">
                <span className="mr-2 text-4xl font-black text-electric-700">{data.today.completedCount}</span>
                of {data.today.totalExercises} exercises completed
              </p>
              <p className="text-slate-600">
                <span className="mr-2 text-4xl font-black text-electric-700">{data.today.displayPracticed}</span>
                practiced today
              </p>
            </div>
          </div>
          <div className="mt-7 flex items-center gap-5">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-electric-600" style={{ width: `${data.today.percent}%` }} />
            </div>
            <span className="font-black text-electric-700">{data.today.percent}%</span>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
            {data.session.exercises.map((exercise, index) => (
              <div key={exercise.id} className="relative text-center">
                <div
                  className={cn(
                    "mx-auto grid h-8 w-8 place-items-center rounded-full border text-sm font-black",
                    exercise.status === "completed" && "border-emerald-500 bg-emerald-500 text-white",
                    exercise.status === "current" && "border-electric-600 bg-white text-electric-700",
                    exercise.status === "upcoming" && "border-slate-200 bg-slate-200 text-slate-600",
                  )}
                >
                  {exercise.status === "completed" ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <p className={cn("mt-3 text-sm font-bold text-slate-600", exercise.status === "current" && "text-electric-700")}>{exercise.title}</p>
              </div>
            ))}
          </div>
        </div>
        <Link
          className="inline-flex h-16 items-center justify-center gap-3 rounded-xl bg-electric-600 px-10 text-lg font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)] hover:bg-electric-700"
          href={`/train/${productType}`}
        >
          <Play className="h-5 w-5 fill-current" />
          Continue Training
        </Link>
      </div>
    </section>
  );
}

function PracticeCalendar({ data }: { data: ProgressPayload }) {
  const today = localDateString();
  const cells = useMemo(() => getMonthDays(data.calendar.month), [data.calendar.month]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-black">Practice Calendar</h2>
        <p className="font-bold text-slate-600">{monthTitle(data.calendar.month)}</p>
      </div>
      <div className="mt-7 grid grid-cols-7 gap-3 text-center text-sm font-bold text-slate-500">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <span key={day}>{day}</span>
        ))}
        {cells.map((cell, index) => {
          const activity = cell.date ? data.calendar.activityByDate[cell.date] : undefined;
          const isToday = cell.date === today;
          return (
            <span
              className={cn(
                "grid h-9 w-9 place-items-center justify-self-center rounded-full text-sm",
                !cell.inMonth && "text-slate-300",
                cell.inMonth && !activity && "bg-slate-100 text-slate-600",
                activity?.fullSessionCompleted && "bg-emerald-500 text-white",
                activity && !activity.fullSessionCompleted && "bg-amber-400 text-white",
                isToday && "ring-2 ring-electric-600 ring-offset-2",
              )}
              key={`${cell.date || "empty"}-${index}`}
            >
              {cell.day}
            </span>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap gap-5 text-sm text-slate-600">
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-500" />Full session</span>
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-400" />Partial practice</span>
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-slate-200" />No practice</span>
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full border-2 border-electric-600" />Today</span>
      </div>
    </section>
  );
}

function Milestones({ milestones }: { milestones: ProgressMilestone[] }) {
  const icons = [Flag, Star, CalendarDays, Lock];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-black">Milestones</h2>
        <span className="text-sm font-black text-electric-700">View all</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-5">
        {milestones.map((milestone, index) => {
          const Icon = icons[index] ?? Star;
          const done = milestone.status === "completed";
          return (
            <div className="relative rounded-2xl border border-slate-200 p-6 text-center" key={milestone.title}>
              {done ? (
                <span className="absolute right-8 top-6 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
              <span className={cn("mx-auto grid h-20 w-20 place-items-center rounded-full", done ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-electric-700")}>
                <Icon className="h-9 w-9" />
              </span>
              <h3 className="mt-4 font-black text-black">{milestone.title}</h3>
              <p className="mt-1 text-slate-600">
                {done ? "Completed" : `${milestone.current} / ${milestone.target}${milestone.title.includes("Minutes") ? " min" : ""}`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentActivityList({ recentActivity }: { recentActivity: RecentActivity[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-black">Recent Activity</h2>
        <span className="text-sm font-black text-electric-700">View all</span>
      </div>
      <div className="mt-5 divide-y divide-slate-200">
        {recentActivity.length ? (
          recentActivity.map((item) => (
            <div className="flex items-center gap-5 py-4" key={`${item.date}-${item.subtitle}`}>
              <span className={cn("grid h-12 w-12 place-items-center rounded-full text-white", item.status === "full" ? "bg-emerald-500" : "bg-electric-600")}>
                {item.status === "full" ? <CheckCircle2 className="h-7 w-7" /> : <CalendarDays className="h-7 w-7" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-700">{item.label}</p>
                <p className="text-sm text-slate-500">{item.subtitle}</p>
              </div>
              <span className="font-bold text-slate-600">{item.displayDuration}</span>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-slate-500">Complete your first exercise to start tracking progress.</p>
        )}
      </div>
    </section>
  );
}

export function TrainingProgressDashboard({ productType }: { productType: VoiceFlexProduct }) {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      const orderNumber = window.localStorage.getItem(VERIFIED_ORDER_NUMBER_KEY);
      if (!orderNumber) {
        setError("Verify your Amazon order first to unlock progress tracking.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber, productType }),
        });
        const payload = (await response.json()) as unknown;

        if (!response.ok || !isProgressPayload(payload)) {
          const message = (payload as ProgressErrorPayload | null)?.message ?? "We couldn’t load your progress right now.";
          throw new Error(message);
        }

        if (!cancelled) {
          setData(payload);
          setError("");
        }
      } catch (loadError) {
        console.warn("[training-progress] Failed to load progress.", loadError);
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "We couldn’t load your progress right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [productType]);

  return (
    <main className="min-h-screen bg-[#f4f8fd] text-navy-950 lg:pl-[272px]">
      <ProgressSidebar productType={productType} />
      <div className="mx-auto max-w-[1460px] px-5 py-8 md:px-8 lg:px-9">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-black">Your Progress</h1>
            <p className="mt-3 text-lg text-slate-600">Track your practice, celebrate consistency, and continue your Voice Flex journey.</p>
          </div>
          <div className="flex items-center gap-10">
            <TopMetric icon="fire" value={data?.stats.practiceStreak ?? 0} label="day streak" />
            <TopMetric icon="timer" value={data?.stats.totalMinutes ?? 0} label="total minutes" />
          </div>
        </header>

        {loading ? (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-600 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            Loading your progress...
          </section>
        ) : error ? (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-black text-black">Progress not available yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">{error}</p>
            <Link className="mt-6 inline-flex rounded-xl bg-electric-600 px-6 py-3 font-black text-white" href="/">
              Back to order verification
            </Link>
          </section>
        ) : data ? (
          <div className="mt-10 space-y-8">
            <TodayProgressCard data={data} productType={productType} />

            <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
              <StatCard Icon={Flame} label="Practice Streak" value={data.stats.practiceStreak} suffix="days" />
              <StatCard Icon={Timer} label="Total Minutes" value={data.stats.totalMinutes} suffix="min" />
              <StatCard Icon={CheckCircle2} label="Exercises Completed" value={data.stats.exercisesCompleted} />
              <StatCard Icon={Trophy} label="Full Sessions" value={data.stats.fullSessions} />
            </section>

            <section className="grid gap-8 xl:grid-cols-[1.05fr_1fr_1.18fr]">
              <PracticeCalendar data={data} />
              <Milestones milestones={data.milestones} />
              <RecentActivityList recentActivity={data.recentActivity} />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
