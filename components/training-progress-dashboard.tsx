"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Info,
  Flame,
  Flag,
  Lock,
  Music2,
  Play,
  Star,
  Timer,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { TrainingSidebar } from "@/components/training-sidebar";
import type { VoiceFlexProduct } from "@/lib/training-product";
import {
  VoiceFlexBadge,
  VoiceFlexRocket,
  VoiceFlexSparkline,
  VoiceFlexStarPanelIcon,
  VoiceFlexTrophy,
  VoiceFlexWavePattern
} from "@/components/visuals/voice-flex-progress-visuals";

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

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const weekTrend = [6, 9, 8, 14, 7, 6, 8.5];
const weekMinutes = [6, 12, 9, 15, 10, 4, 8.5];
const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatMinutes(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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

function StatCard({
  Icon,
  label,
  value,
  suffix,
  hint,
  tone = "blue",
}: {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  tone?: "blue" | "green" | "purple";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-electric-700",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
  }[tone];

  return (
    <div className="flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full", toneClass)}>
        <Icon className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-1 text-3xl font-black tracking-tight text-black">
          {value}
          {suffix ? <span className="ml-1 text-xl">{suffix}</span> : null}
        </p>
        {hint ? <p className="mt-1 text-sm font-medium text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}

function TodayProgressCard({ data, productType }: { data: ProgressPayload; productType: VoiceFlexProduct }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[420px] opacity-60 xl:block">
        <svg className="h-full w-full" viewBox="0 0 420 240" fill="none" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, index) => (
            <path
              d={`M${20 + index * 5} ${20 + index * 18} C 150 ${-15 + index * 24}, 230 ${75 + index * 9}, 420 ${28 + index * 17}`}
              key={index}
              stroke="#D8EAFE"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
      <div className="relative grid gap-8 xl:grid-cols-[1fr_280px] xl:items-center">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-black">Today&apos;s Progress</h2>
              <p className="mt-2 text-sm text-slate-600">
                {productLabel(productType)} <span className="px-2">•</span> Day {data.currentDay}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-14">
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
          <div className="relative mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
            <div className="absolute left-[8%] right-[8%] top-4 hidden h-px bg-slate-200 md:block" />
            {data.session.exercises.map((exercise, index) => (
              <div key={exercise.id} className="relative z-10 text-center">
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
        <div className="flex flex-col items-stretch gap-4">
          <Link
            className="inline-flex h-16 items-center justify-center gap-3 rounded-xl bg-electric-600 px-10 text-lg font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)] hover:bg-electric-700"
            href={`/train/${productType}`}
          >
            <Play className="h-5 w-5 fill-current" />
            Continue Training
          </Link>
          <p className="text-center text-sm font-semibold text-slate-500">✧ Keep the momentum going!</p>
        </div>
      </div>
    </section>
  );
}

function CleanTopMetric({ icon, value, label }: { icon: "fire" | "timer"; value: string | number; label: string }) {
  const Icon = icon === "fire" ? Flame : Timer;
  return (
    <div className="flex items-center gap-3">
      <Icon className={cn("h-7 w-7", icon === "fire" ? "fill-orange-200 text-orange-500" : "text-slate-800")} />
      <span>
        <span className="block text-lg font-black leading-5 text-black">{value}</span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </span>
    </div>
  );
}

function RocketIllustration() {
  return (
    <svg className="h-28 w-28 drop-shadow-[0_18px_18px_rgba(79,70,229,0.24)]" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path d="M76 16 C92 18 104 30 106 46 C95 51 81 62 69 79 L49 59 C56 46 66 29 76 16Z" fill="url(#rocketBody)" />
      <path d="M52 58 L33 64 L44 75" fill="#4F46E5" />
      <path d="M69 76 L64 96 L53 85" fill="#2563EB" />
      <circle cx="81" cy="42" r="10" fill="#C7D2FE" />
      <circle cx="81" cy="42" r="5" fill="#6366F1" />
      <path d="M43 79 C35 82 28 89 24 99 C34 95 42 89 46 82" fill="#F59E0B" />
      <path d="M38 75 C29 76 20 81 13 89 C25 88 35 84 42 78" fill="#A855F7" opacity="0.75" />
      <path d="M96 22 C100 25 103 29 105 34" stroke="#EEF2FF" strokeLinecap="round" strokeWidth="5" />
      <defs>
        <linearGradient id="rocketBody" x1="49" x2="109" y1="79" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#145FF2" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PremiumTodayProgressCard({ data, productType }: { data: ProgressPayload; productType: VoiceFlexProduct }) {
  const completedPercent = Math.max(0, Math.min(100, data.today.percent));

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#dbe5f2] bg-gradient-to-br from-white via-white to-[#f1eaff] p-7 shadow-[0_28px_70px_rgba(15,23,42,0.12)] md:p-9">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-[radial-gradient(circle_at_70%_25%,rgba(139,92,246,0.18),transparent_34%),linear-gradient(135deg,rgba(234,242,255,0.92),rgba(255,255,255,0.30),rgba(245,240,255,0.90))] md:block" />
      <VoiceFlexWavePattern className="absolute right-0 top-0 hidden h-full w-[620px] opacity-90 xl:block" />
      <div className="pointer-events-none absolute right-7 top-5 hidden xl:block">
        <VoiceFlexRocket className="h-40 w-40" />
      </div>
      <span className="absolute right-[18%] top-16 h-2 w-2 rounded-full bg-[#145ff2]" />
      <span className="absolute right-[12%] top-32 h-2 w-2 rounded-full bg-[#f59e0b]" />
      <span className="absolute right-[24%] bottom-16 h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
      <div className="pointer-events-none absolute left-[23%] top-14 hidden h-9 w-9 md:block">
        <span className="absolute left-4 top-0 h-9 w-1 rounded-full bg-amber-300" />
        <span className="absolute left-4 top-0 h-9 w-1 rotate-45 rounded-full bg-amber-300" />
        <span className="absolute left-4 top-0 h-9 w-1 rotate-90 rounded-full bg-amber-300" />
        <span className="absolute left-4 top-0 h-9 w-1 -rotate-45 rounded-full bg-amber-300" />
      </div>

      <div className="relative grid gap-8 xl:grid-cols-[1fr_300px] xl:items-center">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#071327]">Today&apos;s Progress</h2>
              <p className="mt-3 text-sm font-medium text-slate-600">
                {productLabel(productType)} <span className="px-2">&bull;</span> Day {data.currentDay}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-8 xl:pr-52">
              <p className="text-slate-600">
                <span className="mr-2 text-4xl font-black text-[#145ff2]">{data.today.completedCount}</span>
                of {data.today.totalExercises} exercises completed
              </p>
              <div className="hidden h-12 w-px bg-slate-200 md:block" />
              <p className="text-slate-600">
                <span className="mr-2 text-4xl font-black text-[#145ff2]">{data.today.displayPracticed}</span>
                practiced today
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-5">
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-[#145ff2] via-[#2563eb] to-[#4f46e5] shadow-[0_0_22px_rgba(20,95,242,0.42)]" style={{ width: `${completedPercent}%` }} />
            </div>
            <span className="min-w-[48px] text-lg font-black text-[#145ff2]">{completedPercent}%</span>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            <div className="absolute left-[8%] right-[8%] top-5 hidden h-1.5 rounded-full bg-slate-200 md:block" />
            <div className="absolute left-[8%] top-5 hidden h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-[#18bf85] md:block" style={{ width: `${completedPercent * 0.84}%` }} />
            {data.session.exercises.map((exercise, index) => {
              const completed = exercise.status === "completed";
              return (
                <div key={exercise.id} className="relative z-10 text-center">
                  <div
                    className={cn(
                      "mx-auto grid h-11 w-11 place-items-center rounded-full border text-sm font-black shadow-[0_12px_22px_rgba(15,23,42,0.10)]",
                      completed && "border-emerald-500 bg-gradient-to-br from-emerald-400 to-[#18bf85] text-white",
                      exercise.status === "current" && "border-[#145ff2] bg-white text-[#145ff2]",
                      exercise.status === "upcoming" && "border-slate-200 bg-slate-100 text-slate-500",
                    )}
                  >
                    {completed ? <Check className="h-6 w-6" /> : index + 1}
                  </div>
                  <p className={cn("mt-3 text-sm font-black text-slate-700", exercise.status === "current" && "text-[#145ff2]")}>{exercise.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-4 xl:pt-24">
          <Link
            className="inline-flex h-16 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#145ff2] to-[#0f4ed6] px-8 text-lg font-black text-white shadow-[0_18px_34px_rgba(20,95,242,0.30)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(20,95,242,0.34)]"
            href={`/train/${productType}`}
          >
            <Play className="h-5 w-5 fill-current" />
            Continue Training
          </Link>
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
            <Star className="h-4 w-4 fill-violet-300 text-violet-400" />
            Keep the momentum going!
          </p>
        </div>
      </div>
    </section>
  );
}

function MiniSparkline({ tone }: { tone: "blue" | "green" | "purple" }) {
  const stroke = tone === "green" ? "#18bf85" : tone === "purple" ? "#8b5cf6" : "#145ff2";
  return (
    <svg className="absolute bottom-5 right-6 h-11 w-24 opacity-55" viewBox="0 0 96 44" fill="none" aria-hidden="true">
      <path d="M3 36 C16 24 25 24 36 27 C49 31 55 20 68 18 C78 16 84 10 93 4" stroke={stroke} strokeLinecap="round" strokeWidth="2" />
      <path d="M3 36 C16 24 25 24 36 27 C49 31 55 20 68 18 C78 16 84 10 93 4" stroke={stroke} strokeLinecap="round" strokeWidth="6" opacity="0.09" />
    </svg>
  );
}

function PremiumStatCard({
  Icon,
  label,
  value,
  suffix,
  hint,
  tone = "blue",
}: {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  tone?: "blue" | "green" | "purple" | "orange";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-[#145ff2] shadow-[0_12px_26px_rgba(20,95,242,0.12)]",
    green: "bg-emerald-50 text-emerald-600 shadow-[0_12px_26px_rgba(24,191,133,0.12)]",
    purple: "bg-violet-50 text-violet-600 shadow-[0_12px_26px_rgba(139,92,246,0.13)]",
    orange: "bg-orange-50 text-orange-500 shadow-[0_12px_26px_rgba(245,158,11,0.14)]",
  }[tone];

  return (
    <div className="relative min-h-[152px] overflow-hidden rounded-[26px] border border-[#dbe5f2] bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.09)]">
      <VoiceFlexSparkline className="absolute bottom-5 right-5 h-14 w-28 opacity-65" tone={tone} />
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-100/50 blur-2xl" />
      <div className="relative flex items-center gap-5">
        <span className={cn("grid h-20 w-20 shrink-0 place-items-center rounded-full", toneClass)}>
          <Icon className="h-10 w-10" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-600">{label}</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-black">
            {value}
            {suffix ? <span className="ml-1 text-xl">{suffix}</span> : null}
          </p>
          {hint ? <p className="mt-1 text-sm font-medium text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

function TrendChartCard() {
  const width = 320;
  const height = 120;
  const max = 20;
  const points = weekTrend.map((value, index) => {
    const x = 20 + (index * (width - 40)) / (weekTrend.length - 1);
    const y = height - 18 - (value / max) * (height - 34);
    return { x, y, value };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-black text-black">7-Day Trend</h2>
        <Info className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-4 grid grid-cols-[28px_1fr] gap-2">
        <div className="flex h-[140px] flex-col justify-between text-xs font-semibold text-slate-500">
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>
        <div>
          <svg className="h-[140px] w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            <path d="M20 102 H300" stroke="#CBD5E1" strokeWidth="1" />
            <path d={path} fill="none" stroke="#1769F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {points.map((point, index) => (
              <circle cx={point.x} cy={point.y} fill="white" key={index} r="4.5" stroke="#1769F6" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            ))}
            <g transform={`translate(${points[6].x - 36} ${points[6].y - 37})`}>
              <rect fill="#F8FBFF" height="26" rx="6" stroke="#1769F6" width="58" />
              <text fill="#1769F6" fontSize="12" fontWeight="800" x="10" y="17">
                8.5 min
              </text>
            </g>
          </svg>
          <div className="grid grid-cols-7 text-center text-sm font-medium text-slate-500">
            {weekLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MinutesPracticedCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-black text-black">Minutes Practiced <span className="font-medium text-slate-500">(Last 7 Days)</span></h2>
        <Info className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-5 grid grid-cols-[28px_1fr] gap-2">
        <div className="flex h-[136px] flex-col justify-between text-xs font-semibold text-slate-500">
          <span>20</span>
          <span>15</span>
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>
        <div>
          <div className="flex h-[136px] items-end justify-between border-b border-slate-200 px-3">
            {weekMinutes.map((value, index) => (
              <div className="flex w-8 flex-col items-center gap-2" key={`${weekLabels[index]}-${value}`}>
                <span className="text-sm font-bold text-slate-700">{formatMinutes(value)}</span>
                <span className="w-4 rounded-t bg-electric-600" style={{ height: `${Math.max(18, (value / 20) * 104)}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 text-center text-sm font-medium text-slate-500">
            {weekLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MonthlyGoalCard({ totalMinutes }: { totalMinutes: number }) {
  const goal = 30;
  const percent = Math.min(100, Math.round((totalMinutes / goal) * 100));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-black text-black">Monthly Goal Progress</h2>
        <Info className="h-4 w-4 text-slate-400" />
      </div>
      <div className="mt-5 flex items-center gap-8">
        <div className="relative grid h-40 w-40 shrink-0 place-items-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
            <circle cx="70" cy="70" fill="none" r={radius} stroke="#E8EEF7" strokeWidth="13" />
            <circle
              cx="70"
              cy="70"
              fill="none"
              r={radius}
              stroke="#1769F6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth="13"
            />
          </svg>
          <div className="text-center">
            <p className="text-3xl font-black text-black">{percent}%</p>
            <p className="font-black text-slate-600">of goal</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Monthly Goal</p>
          <p className="mt-2 font-black text-black">30 minutes</p>
          <p className="mt-4 text-2xl font-black text-electric-700">
            {formatMinutes(totalMinutes)} <span className="text-base font-medium text-slate-500">/ 30 min</span>
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">Keep going!</p>
        </div>
      </div>
    </section>
  );
}

function PracticeCalendar({ data }: { data: ProgressPayload }) {
  const today = localDateString();
  const [viewedMonthDate, setViewedMonthDate] = useState(() => parseMonthKey(data.calendar.month));
  const viewedMonth = getMonthKey(viewedMonthDate);
  const cells = useMemo(() => getMonthDays(viewedMonth), [viewedMonth]);

  function goToPreviousMonth() {
    setViewedMonthDate((current) => addMonths(current, -1));
  }

  function goToNextMonth() {
    setViewedMonthDate((current) => addMonths(current, 1));
  }

  return (
    <section className="rounded-[24px] border border-[#dbe5f2] bg-white p-7 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-black">Practice Calendar</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="grid h-8 w-8 place-items-center rounded-full text-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#145ff2] focus:outline-none focus:ring-2 focus:ring-electric-600 focus:ring-offset-2"
            aria-label="Show previous month"
          >
            {"<"}
          </button>
          <p className="min-w-[126px] text-center font-black text-slate-700">{monthTitle(viewedMonth)}</p>
          <button
            type="button"
            onClick={goToNextMonth}
            className="grid h-8 w-8 place-items-center rounded-full text-lg text-slate-500 transition hover:bg-blue-50 hover:text-[#145ff2] focus:outline-none focus:ring-2 focus:ring-electric-600 focus:ring-offset-2"
            aria-label="Show next month"
          >
            {">"}
          </button>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-7 gap-3 text-center text-sm font-bold text-slate-500">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <span key={day}>{day}</span>
        ))}
        {cells.map((cell, index) => {
          const activity = cell.date ? data.calendar.activityByDate[cell.date] : undefined;
          const isToday = cell.inMonth && cell.date === today;
          return (
            <span
              className={cn(
                "grid h-9 w-9 place-items-center justify-self-center rounded-full text-sm font-black transition",
                !cell.inMonth && "text-slate-300",
                cell.inMonth && !activity && "bg-slate-100 text-slate-600",
                activity?.fullSessionCompleted && "bg-emerald-500 text-white shadow-[0_10px_20px_rgba(24,191,133,0.22)]",
                activity && !activity.fullSessionCompleted && "bg-amber-400 text-white shadow-[0_10px_20px_rgba(245,158,11,0.20)]",
                isToday && "ring-2 ring-electric-600 ring-offset-2",
              )}
              key={`${cell.date || "empty"}-${index}`}
            >
              {cell.day}
            </span>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap gap-5 text-sm font-medium text-slate-600">
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-500" />Full session</span>
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-400" />Partial practice</span>
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full bg-slate-200" />No practice</span>
        <span><span className="mr-2 inline-block h-3 w-3 rounded-full border-2 border-electric-600" />Today</span>
      </div>
    </section>
  );
}

function Milestones({ milestones, productType }: { milestones: ProgressMilestone[]; productType: VoiceFlexProduct }) {
  const icons = [Flag, Star, CalendarDays, Lock];
  const tones = [
    "from-emerald-50 to-white text-emerald-600 border-emerald-100",
    "from-emerald-50 to-white text-emerald-600 border-emerald-100",
    "from-blue-50 to-white text-[#145ff2] border-blue-100",
    "from-violet-50 to-white text-violet-600 border-violet-100",
  ];
  return (
    <section className="rounded-[24px] border border-[#dbe5f2] bg-white p-7 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-black">Milestones</h2>
        <Link href={`/train/${productType}/milestones`} className="text-sm font-black text-electric-700 hover:text-electric-800">
          View all
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {milestones.map((milestone, index) => {
          const Icon = icons[index] ?? Star;
          const done = milestone.status === "completed";
          const percent = Math.max(0, Math.min(100, Math.round((milestone.current / milestone.target) * 100)));
          const isSession = milestone.title.toLowerCase().includes("session");
          return (
            <div className={cn("relative min-h-[188px] overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-center shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.09)]", tones[index] ?? tones[2])} key={milestone.title}>
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/70 blur-xl" />
              {done ? (
                <span className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_8px_16px_rgba(24,191,133,0.24)]">
                  <Check className="h-4 w-4" />
                </span>
              ) : null}
              {done ? (
                isSession ? (
                  <VoiceFlexTrophy className="mx-auto h-24 w-24" />
                ) : (
                  <VoiceFlexBadge className="mx-auto h-24 w-24" />
                )
              ) : (
                <span
                  className="relative mx-auto grid h-24 w-24 place-items-center rounded-full shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
                  style={{ background: `conic-gradient(${index === 3 ? "#8b5cf6" : "#145ff2"} ${percent * 3.6}deg, #e5edf8 0deg)` }}
                >
                  <span className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white">
                    <Icon className="h-9 w-9" />
                  </span>
                </span>
              )}
              <h3 className="mt-4 font-black text-black">{milestone.title}</h3>
              <p className="mt-1 text-sm font-medium text-slate-600">
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
    <section className="rounded-[24px] border border-[#dbe5f2] bg-white p-7 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-black">Recent Activity</h2>
        <span className="text-sm font-black text-electric-700">View all</span>
      </div>
      <div className="mt-6 space-y-3">
        {recentActivity.length ? (
          recentActivity.map((item) => (
            <div className="flex items-center gap-5 rounded-2xl border border-transparent p-3 transition hover:border-blue-100 hover:bg-blue-50/40" key={`${item.date}-${item.subtitle}`}>
              <span className={cn("grid h-16 w-16 place-items-center rounded-full text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)]", item.status === "full" ? "bg-gradient-to-br from-emerald-400 to-[#18bf85]" : "bg-gradient-to-br from-[#145ff2] to-[#4f46e5]")}>
                {item.status === "full" ? <CheckCircle2 className="h-7 w-7" /> : item.subtitle.toLowerCase().includes("siren") ? <Music2 className="h-7 w-7" /> : <CalendarDays className="h-7 w-7" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-800">{item.label}</p>
                <p className="text-sm text-slate-500">{item.subtitle}</p>
              </div>
              <span className="font-black text-slate-700">{item.displayDuration}</span>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-slate-500">Complete your first exercise to start tracking progress.</p>
        )}
      </div>
      <div className="mt-7 flex items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 p-5 shadow-[0_16px_32px_rgba(20,95,242,0.08)]">
        <VoiceFlexStarPanelIcon className="h-16 w-16 shrink-0" />
        <div>
          <p className="font-black text-slate-900">Great start! You&apos;re building a strong voice.</p>
          <p className="mt-1 text-sm font-medium text-slate-600">Keep showing up for yourself.</p>
        </div>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(20,95,242,0.10),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f3f7fb_100%)] text-navy-950 lg:pl-[272px]">
      <TrainingSidebar productType={productType} activeItem="progress" />
      <div className="mx-auto max-w-[1460px] px-5 py-8 md:px-8 lg:px-9">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-black">Your Progress</h1>
            <p className="mt-3 text-lg text-slate-600">Track your practice, celebrate consistency, and continue your Voice Flex journey.</p>
          </div>
          <div className="flex items-center gap-10">
            <CleanTopMetric icon="fire" value={data?.stats.practiceStreak ?? 0} label="day streak" />
            <CleanTopMetric icon="timer" value={data?.stats.totalMinutes ?? 0} label="total minutes" />
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
            <PremiumTodayProgressCard data={data} productType={productType} />

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <PremiumStatCard Icon={Flame} label="Practice Streak" value={data.stats.practiceStreak} suffix={data.stats.practiceStreak === 1 ? "day" : "days"} hint="Keep it up!" tone="orange" />
              <PremiumStatCard Icon={Timer} label="Total Minutes" value={data.stats.totalMinutes} suffix="min" hint="This week" />
              <PremiumStatCard Icon={CheckCircle2} label="Exercises Completed" value={data.stats.exercisesCompleted} hint="This week" tone="green" />
              <PremiumStatCard Icon={Trophy} label="Full Sessions" value={data.stats.fullSessions} hint="This week" tone="purple" />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_1fr_1.18fr]">
              <PracticeCalendar data={data} />
              <Milestones milestones={data.milestones} productType={productType} />
              <RecentActivityList recentActivity={data.recentActivity} />
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
