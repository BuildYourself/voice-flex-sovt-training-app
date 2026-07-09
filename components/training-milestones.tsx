"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CalendarCheck,
  Check,
  Clock,
  Flame,
  Lock,
  Medal,
  Mic,
  Music,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Waves
} from "lucide-react";

import {
  computeMilestones,
  computeTrainingBalance,
  computeVoiceJourney,
  getMilestoneOrderAccessId,
  loadLocalMilestones,
  type ComputedMilestone,
  type LocalMilestoneState
} from "@/lib/local-milestones";
import type { VoiceFlexProduct } from "@/lib/training-product";
import { cn } from "@/lib/utils";
import { TrainingSidebar } from "@/components/training-sidebar";

type MilestoneFilter = "all" | "consistency" | "time" | "sessions" | "skills";

function formatMinutes(seconds: number) {
  const minutes = Math.round((seconds / 60) * 10) / 10;
  return Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1);
}

function getMilestoneIcon(milestone: ComputedMilestone) {
  if (milestone.status === "locked") return Lock;
  if (milestone.id.includes("session")) return Trophy;
  if (milestone.category === "time") return Clock;
  if (milestone.category === "consistency") return Flame;
  if (milestone.id.includes("breath")) return Waves;
  if (milestone.id.includes("pitch") || milestone.id.includes("smooth")) return Music;
  return Check;
}

function statusLabel(status: ComputedMilestone["status"]) {
  if (status === "completed") return "Completed";
  if (status === "in-progress") return "In Progress";
  if (status === "locked") return "Locked";
  return "Not Started";
}

function statusClass(status: ComputedMilestone["status"]) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.16)]";
  if (status === "in-progress") return "bg-blue-100 text-electric-700 shadow-[0_8px_20px_rgba(37,99,235,0.14)]";
  if (status === "locked") return "bg-slate-100 text-slate-600";
  return "bg-sky-50 text-sky-700";
}

function categoryVisual(category: ComputedMilestone["category"]) {
  if (category === "starter") {
    return {
      accent: "#22c55e",
      soft: "from-emerald-50 via-white to-white",
      ring: "text-emerald-500",
      icon: "bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-[0_14px_30px_rgba(34,197,94,0.28)]",
      border: "border-emerald-100",
      glow: "bg-emerald-300/20"
    };
  }
  if (category === "time") {
    return {
      accent: "#2563eb",
      soft: "from-blue-50 via-white to-white",
      ring: "text-electric-600",
      icon: "bg-gradient-to-br from-cyan-400 to-electric-700 text-white shadow-[0_14px_30px_rgba(37,99,235,0.26)]",
      border: "border-blue-100",
      glow: "bg-blue-300/20"
    };
  }
  if (category === "consistency") {
    return {
      accent: "#f97316",
      soft: "from-orange-50 via-white to-white",
      ring: "text-orange-500",
      icon: "bg-gradient-to-br from-amber-300 to-orange-600 text-white shadow-[0_14px_30px_rgba(249,115,22,0.26)]",
      border: "border-orange-100",
      glow: "bg-orange-300/20"
    };
  }
  if (category === "sessions") {
    return {
      accent: "#7c3aed",
      soft: "from-violet-50 via-white to-white",
      ring: "text-violet-600",
      icon: "bg-gradient-to-br from-blue-400 to-violet-600 text-white shadow-[0_14px_30px_rgba(124,58,237,0.25)]",
      border: "border-violet-100",
      glow: "bg-violet-300/20"
    };
  }
  return {
    accent: "#0891b2",
    soft: "from-cyan-50 via-white to-white",
    ring: "text-cyan-600",
    icon: "bg-gradient-to-br from-cyan-400 to-indigo-600 text-white shadow-[0_14px_30px_rgba(8,145,178,0.24)]",
    border: "border-cyan-100",
    glow: "bg-cyan-300/20"
  };
}

function milestoneValueLabel(milestone: ComputedMilestone) {
  const value = milestone.category === "time" ? formatMinutes(milestone.value) : milestone.value;
  const target = milestone.category === "time" ? formatMinutes(milestone.target) : milestone.target;
  return `${value} / ${target}`;
}

export function TrainingMilestones({ productType }: { productType: VoiceFlexProduct }) {
  const [state, setState] = useState<LocalMilestoneState | null>(null);
  const [filter, setFilter] = useState<MilestoneFilter>("all");

  useEffect(() => {
    setState(loadLocalMilestones(productType, getMilestoneOrderAccessId()));
  }, [productType]);

  const milestones = useMemo(() => (state ? computeMilestones(state) : []), [state]);
  const journey = useMemo(() => (state ? computeVoiceJourney(state) : null), [state]);
  const balance = useMemo(() => (state ? computeTrainingBalance(state) : []), [state]);

  const featured = ["first_full_session", "ten_minutes", "three_day_streak", "two_full_sessions"]
    .map((id) => milestones.find((milestone) => milestone.id === id))
    .filter((milestone): milestone is ComputedMilestone => Boolean(milestone));

  const visibleMilestones = filter === "all" ? milestones : milestones.filter((milestone) => milestone.category === filter);

  const totals = state?.totals ?? {
    totalSeconds: 0,
    exercisesCompleted: 0,
    fullSessionsCompleted: 0,
    practiceDays: [],
    currentStreak: 0,
    lastPracticeDate: null
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_32%),linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)] text-navy-950 lg:pl-[272px]">
      <TrainingSidebar productType={productType} activeItem="milestones" />
      <div className="mx-auto max-w-[1660px] px-5 py-7 md:px-8 lg:px-10">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-black md:text-5xl">Milestones</h1>
            <p className="mt-3 text-base text-slate-600 md:text-lg">Celebrate your progress and unlock new voice training achievements.</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-700">
            <TopMiniStat icon={<Flame className="h-7 w-7 text-orange-500" />} value={totals.currentStreak} label="day streak" tone="orange" />
            <TopMiniStat icon={<Clock className="h-7 w-7 text-slate-700" />} value={formatMinutes(totals.totalSeconds)} label="total minutes" tone="slate" />
            <TopMiniStat icon={<CalendarCheck className="h-7 w-7 text-electric-700" />} value={totals.fullSessionsCompleted} label="full session" tone="blue" />
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute left-1/2 top-10 h-20 w-20 rounded-full bg-cyan-200/30 blur-2xl" />
          <div className="grid gap-6 px-7 py-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-9">
            <div className="relative z-10">
              <h2 className="flex items-center gap-2 text-2xl font-black text-black">
                Your Voice Journey <Sparkles className="h-5 w-5 fill-amber-300 text-amber-400" />
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-600">Small daily practice builds long-term vocal control.</p>
              <div className="mt-7 flex items-center gap-6">
                <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br from-sky-400 via-electric-600 to-blue-800 text-white shadow-[0_20px_48px_rgba(23,105,246,0.36)]">
                  <div className="absolute -inset-3 rounded-[34px] bg-electric-500/20 blur-xl" />
                  <ShieldCheck className="absolute inset-0 h-full w-full text-blue-100/20" />
                  <span className="relative text-4xl font-black">{journey?.level ?? 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-black text-black">Level {journey?.level ?? 1}</p>
                  <p className="mt-1 text-base font-semibold text-slate-700">{journey?.levelName ?? "Getting Started"}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-electric-600 to-blue-700 shadow-[0_0_18px_rgba(37,99,235,0.35)]" style={{ width: `${journey?.progressToNextLevelPercent ?? 0}%` }} />
                    </div>
                    <span className="text-sm font-black text-electric-700">
                      {journey?.progressToNextLevelPercent ?? 0}% to Level {journey?.nextLevel ?? 2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <JourneyIllustration />
          </div>
          <div className="relative z-10 grid border-t border-slate-200/80 bg-white/75 backdrop-blur md:grid-cols-3">
            <JourneyStat icon={<Clock className="h-7 w-7 text-electric-700" />} value={`${formatMinutes(totals.totalSeconds)} min`} label="Time Trained" tone="blue" />
            <JourneyStat icon={<Flame className="h-7 w-7 text-orange-500" />} value={totals.currentStreak} label="Day Streak" tone="orange" />
            <JourneyStat icon={<CalendarCheck className="h-7 w-7 text-electric-700" />} value={totals.fullSessionsCompleted} label="Full Sessions" tone="cyan" />
          </div>
        </section>

        <h2 className="mt-6 text-xl font-black text-black">Featured Milestones</h2>
        <section className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((milestone) => (
            <FeaturedMilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
            <h2 className="text-2xl font-black text-black">Voice Training Balance</h2>
            <p className="mt-2 text-sm text-slate-600">Based on your completed exercises.</p>
            <div className="mt-6 space-y-4">
              {balance.map((item) => (
                <BalanceRow key={item.label} item={item} />
              ))}
            </div>
          </div>
          <div className="relative grid min-h-[220px] place-items-center overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-7 text-center shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
            <Sparkles className="absolute left-16 top-10 h-5 w-5 fill-blue-300 text-blue-300" />
            <Star className="absolute right-24 top-12 h-5 w-5 fill-indigo-300 text-indigo-300" />
            <Sparkles className="absolute bottom-16 right-14 h-4 w-4 fill-cyan-300 text-cyan-300" />
            <div className="relative">
              <div className="absolute inset-x-0 top-8 mx-auto h-28 w-28 rounded-full bg-electric-400/20 blur-2xl" />
              <Trophy className="relative mx-auto h-28 w-28 fill-blue-500/20 text-electric-600 drop-shadow-[0_18px_22px_rgba(37,99,235,0.22)]" />
              <h2 className="mt-2 text-2xl font-black text-black">You&apos;re doing great!</h2>
              <p className="mx-auto mt-2 max-w-sm font-semibold leading-6 text-slate-700">Every session is a step toward a stronger, more confident voice.</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-black">All Milestones</h2>
            <div className="flex flex-wrap gap-3">
              {(["all", "consistency", "time", "sessions", "skills"] as MilestoneFilter[]).map((item) => (
                <button
                  type="button"
                  onClick={() => setFilter(item)}
                  className={cn(
                    "h-9 min-w-[92px] rounded-xl border border-white bg-white px-4 text-sm font-black text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-electric-700",
                    filter === item && "border-electric-600 bg-electric-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] hover:text-white"
                  )}
                  key={item}
                >
                  {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
            {visibleMilestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TopMiniStat({ icon, value, label, tone }: { icon: React.ReactNode; value: string | number; label: string; tone: "blue" | "orange" | "slate" }) {
  return (
    <div className="flex items-center gap-3 border-r border-slate-200 pr-5 last:border-r-0 last:pr-0">
      <div
        className={cn(
          "grid h-10 w-10 place-items-center rounded-2xl",
          tone === "orange" && "bg-orange-50 shadow-[0_10px_22px_rgba(249,115,22,0.12)]",
          tone === "blue" && "bg-blue-50 shadow-[0_10px_22px_rgba(37,99,235,0.12)]",
          tone === "slate" && "bg-slate-100"
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-lg font-black text-black">{value}</p>
        <p className="text-xs font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function JourneyStat({ icon, value, label, tone }: { icon: React.ReactNode; value: string | number; label: string; tone: "blue" | "orange" | "cyan" }) {
  return (
    <div className="flex items-center justify-center gap-4 border-slate-200 px-6 py-5 md:border-r last:md:border-r-0">
      <div
        className={cn(
          "grid h-12 w-12 place-items-center rounded-2xl",
          tone === "blue" && "bg-blue-50 shadow-[0_12px_26px_rgba(37,99,235,0.12)]",
          tone === "orange" && "bg-orange-50 shadow-[0_12px_26px_rgba(249,115,22,0.13)]",
          tone === "cyan" && "bg-cyan-50 shadow-[0_12px_26px_rgba(8,145,178,0.12)]"
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-black text-black">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function JourneyIllustration() {
  return (
    <div className="relative hidden min-h-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50 lg:block">
      <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-blue-200/40 blur-2xl" />
      <div className="absolute bottom-2 left-8 h-12 w-36 rounded-full bg-cyan-200/30 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 460 180" fill="none" aria-hidden="true">
        <path d="M38 52 C58 38 74 40 92 52 C76 53 57 54 38 52Z" fill="#DBEAFE" />
        <path d="M360 42 C378 28 398 31 418 43 C398 45 378 45 360 42Z" fill="#DBEAFE" />
        <path d="M288 74 C305 61 322 64 342 75 C324 77 305 77 288 74Z" fill="#E0F2FE" />
        <path d="M20 160 L100 105 L140 122 L205 62 L252 126 L330 38 L430 160 Z" fill="#EAF2FF" />
        <path d="M205 62 L235 98 L252 126 L330 38 L430 160 H260 Z" fill="#DDEBFF" />
        <path d="M242 126 L330 38 L430 160 H338 Z" fill="#CFE0FF" opacity="0.75" />
        <path d="M84 142 C126 118 169 154 208 124 C257 87 286 115 314 84 C342 53 360 58 370 18" stroke="#1769F6" strokeDasharray="10 12" strokeLinecap="round" strokeWidth="4" />
        <path d="M370 18 V56" stroke="#1769F6" strokeLinecap="round" strokeWidth="4" />
        <path d="M370 18 H402 L392 31 H370" fill="#1769F6" />
      </svg>
    </div>
  );
}

function FeaturedMilestoneCard({ milestone }: { milestone: ComputedMilestone }) {
  const Icon = getMilestoneIcon(milestone);
  const visual = categoryVisual(milestone.category);
  const isLocked = milestone.status === "locked";
  return (
    <div className={cn("group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.10)]", visual.soft, visual.border, isLocked && "opacity-85")}>
      <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl", visual.glow)} />
      {milestone.status === "completed" && (
        <>
          <Sparkles className="absolute left-8 top-5 h-4 w-4 fill-emerald-300 text-emerald-300" />
          <Star className="absolute right-10 top-10 h-3.5 w-3.5 fill-amber-300 text-amber-300" />
        </>
      )}
      <ProgressRing milestone={milestone} size="large">
        <div className={cn("grid h-16 w-16 place-items-center rounded-full", isLocked ? "bg-slate-100 text-slate-500" : visual.icon)}>
          <Icon className="h-8 w-8" />
        </div>
      </ProgressRing>
      <h3 className="mt-4 font-black text-black">{milestone.title}</h3>
      <p className="mx-auto mt-2 max-w-[190px] text-sm leading-5 text-slate-600">{milestone.description}</p>
      <div className="mt-3 text-xs font-black text-slate-500">{milestoneValueLabel(milestone)}</div>
      <span className={cn("mt-3 inline-flex rounded-xl px-4 py-2 text-xs font-black", statusClass(milestone.status))}>{statusLabel(milestone.status)}</span>
    </div>
  );
}

function ProgressRing({ milestone, size, children }: { milestone: ComputedMilestone; size: "large" | "small"; children: React.ReactNode }) {
  const visual = categoryVisual(milestone.category);
  const progress = milestone.status === "completed" ? 100 : milestone.progressPercent;
  const ringTrack = milestone.status === "locked" ? "#e2e8f0" : "#eaf2ff";
  const ringColor = milestone.status === "locked" ? "#94a3b8" : visual.accent;
  const dimension = size === "large" ? "h-24 w-24" : "h-20 w-20";
  const inner = size === "large" ? "h-[76px] w-[76px]" : "h-16 w-16";

  return (
    <div
      className={cn("relative mx-auto grid place-items-center rounded-full shadow-[0_18px_34px_rgba(15,23,42,0.08)]", dimension)}
      style={{ background: `conic-gradient(${ringColor} ${progress * 3.6}deg, ${ringTrack} 0deg)` }}
    >
      <div className={cn("grid place-items-center rounded-full bg-white", inner)}>
        {children}
      </div>
    </div>
  );
}

function BalanceRow({ item }: { item: ReturnType<typeof computeTrainingBalance>[number] }) {
  const color =
    item.label === "Breath Control"
      ? "from-cyan-400 to-electric-600"
      : item.label === "Vocal Flexibility"
        ? "from-blue-400 to-electric-700"
        : item.label === "Pitch Stability"
          ? "from-violet-400 to-purple-600"
          : "from-orange-400 to-orange-600";
  const iconClass =
    item.label === "Breath Control"
      ? "bg-cyan-50 text-cyan-700"
      : item.label === "Vocal Flexibility"
        ? "bg-blue-50 text-electric-700"
        : item.label === "Pitch Stability"
          ? "bg-violet-50 text-violet-700"
          : "bg-orange-50 text-orange-600";
  const Icon = item.label === "Breath Control" ? Waves : item.label === "Vocal Flexibility" ? Mic : item.label === "Pitch Stability" ? Music : CalendarCheck;
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.035)] md:grid-cols-[260px_1fr_185px] md:items-center">
      <div className="flex items-center gap-3">
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-black">{item.label}</span>
            <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide", iconClass)}>Level {item.level}</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">{item.levelLabel}</p>
        </div>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-slate-100 shadow-inner" aria-label={`${item.label} ${item.display}`}>
        <div className={cn("h-full rounded-full bg-gradient-to-r shadow-[0_0_16px_rgba(37,99,235,0.20)]", color)} style={{ width: `${item.percent}%` }} />
      </div>
      <span className="text-sm font-black text-slate-700 md:text-right">{item.display}</span>
    </div>
  );
}

function MilestoneCard({ milestone }: { milestone: ComputedMilestone }) {
  const Icon = getMilestoneIcon(milestone);
  const visual = categoryVisual(milestone.category);
  const isLocked = milestone.status === "locked";
  return (
    <div className={cn("group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]", visual.soft, visual.border, isLocked && "opacity-85")}>
      <div className={cn("absolute -right-10 -top-12 h-24 w-24 rounded-full blur-2xl", visual.glow)} />
      <ProgressRing milestone={milestone} size="small">
        <div className={cn("grid h-12 w-12 place-items-center rounded-full", isLocked ? "bg-slate-100 text-slate-500" : milestone.status === "completed" ? "bg-gradient-to-br from-emerald-400 to-green-600 text-white" : visual.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </ProgressRing>
      <h3 className="mt-4 text-sm font-black text-black">{milestone.title}</h3>
      <p className="mx-auto mt-2 min-h-[42px] max-w-[170px] text-xs leading-5 text-slate-600">{milestone.description}</p>
      <div className="mt-2 text-[11px] font-black text-slate-500">{milestoneValueLabel(milestone)}</div>
      <span className={cn("mt-3 inline-flex rounded-xl px-4 py-2 text-xs font-black", statusClass(milestone.status))}>{statusLabel(milestone.status)}</span>
    </div>
  );
}
