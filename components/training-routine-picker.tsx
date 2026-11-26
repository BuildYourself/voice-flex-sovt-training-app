"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Check, Clock, Flame, Gauge, Shield, Timer } from "lucide-react";

import { ReviewRequest } from "@/components/review-request";
import { TrainingSidebar } from "@/components/training-sidebar";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import { getDefaultKit, getKitOptions, getKitProfile, type VoiceFlexKit } from "@/lib/kits";
import {
  getRoutineSkills,
  getRoutineTotalSeconds,
  resolveRoutineSteps,
  ROUTINE_ORDER,
  ROUTINES,
  SKILL_LABELS,
  type RoutineId
} from "@/lib/routines";
import { getRoutineDayKey } from "@/lib/training-progress";
import { formatSessionDuration } from "@/lib/training-sessions";
import type { VoiceFlexProduct } from "@/lib/training-product";
import { cn } from "@/lib/utils";

type RoutineStatus = { done: number; total: number; complete: boolean };

const SKILL_CHIP: Record<string, string> = {
  breath: "bg-cyan-50 text-cyan-700",
  flexibility: "bg-blue-50 text-electric-700",
  pitch: "bg-violet-50 text-violet-700",
  speaking: "bg-emerald-50 text-emerald-700"
};

export function TrainingRoutinePicker({ productType }: { productType: VoiceFlexProduct }) {
  const { progress, kit: storedKit, setKit, loading } = useTrainingProgress(productType);
  const kit: VoiceFlexKit = storedKit ?? getDefaultKit(productType);
  const kitProfile = getKitProfile(kit);
  const kitOptions = getKitOptions(productType);

  if (loading || !progress) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Loading your routines...</div>
      </main>
    );
  }

  const statusFor = (id: RoutineId): RoutineStatus => {
    const total = resolveRoutineSteps(id, kit).length;
    const done = (progress.completedExercises[getRoutineDayKey(ROUTINES[id].slot)] ?? []).length;
    return { done: Math.min(done, total), total, complete: done >= total };
  };

  const todayDone = ROUTINE_ORDER.map((id) => ({ id, status: statusFor(id) })).filter((item) => item.status.done > 0);
  const [featuredId, ...otherIds] = ROUTINE_ORDER;

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-navy-950">
      <TrainingSidebar productType={productType} activeItem="sessions" />

      <main className="px-4 pb-12 pt-4 sm:px-6 lg:ml-[272px] lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1280px]">
          <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[30px] font-black leading-tight tracking-normal text-black md:text-[38px]">Choose your routine</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Short and often works best. Pick 1 to 3 routines a day, whatever fits what you&apos;re doing next.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Metric icon={<Flame className="h-6 w-6 text-orange-500" />} value={progress.streak} label="day streak" />
              <div className="h-10 w-px bg-slate-200" />
              <Metric icon={<Timer className="h-6 w-6 text-electric-700" />} value={progress.totalMinutes} label="total minutes" />
            </div>
          </header>

          <section className="mt-6 flex flex-col gap-3 rounded-3xl border border-blue-100 bg-white p-4 shadow-card md:flex-row md:items-center md:justify-between md:p-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Instructions written for</p>
              <p className="mt-1 text-lg font-black text-navy-950">{kitProfile.name}</p>
              <p className="text-sm text-slate-600">With {kitProfile.contents}.</p>
            </div>
            {kitOptions.length > 1 ? (
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row" role="group" aria-label="Which kit do you have?">
                {kitOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setKit(option)}
                    aria-pressed={option === kit}
                    className={cn(
                      "h-11 rounded-xl border px-4 text-sm font-black transition",
                      option === kit
                        ? "border-electric-600 bg-electric-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-electric-700"
                    )}
                  >
                    {option === "pro" ? "I have the caps set" : "I have the straw set"}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          {todayDone.length ? (
            <section className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-black text-slate-600">Today:</span>
              {todayDone.map(({ id, status }) => (
                <span
                  key={id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold",
                    status.complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}
                >
                  {status.complete ? <Check className="h-4 w-4" /> : null}
                  {ROUTINES[id].title}
                  {status.complete ? "" : ` ${status.done}/${status.total}`}
                </span>
              ))}
            </section>
          ) : null}

          <section className="mt-6">
            <RoutineCard productType={productType} id={featuredId} kit={kit} status={statusFor(featuredId)} featured />
          </section>

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherIds.map((id) => (
              <RoutineCard key={id} productType={productType} id={id} kit={kit} status={statusFor(id)} />
            ))}
          </section>

          <section className="mt-8">
            <ReviewRequest productType={productType} />
          </section>

          <section className="mt-4 grid gap-4 md:grid-cols-2">
            <Link
              href={`/train/${productType}?setup=1`}
              className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-blue-200"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-electric-700">
                <BookOpen className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-black text-navy-950">New to SOVT? Read the 1-minute guide</span>
                <span className="text-sm text-slate-600">What it is, how it works and how to get the most out of it.</span>
              </span>
            </Link>
            <div className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-slate-700">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p>
                <span className="font-black text-navy-950">It should feel easy.</span> Stop if you feel pain, scratchiness or dizziness.
                Hoarseness that hasn&apos;t improved after 4 weeks needs a doctor.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>
        <span className="block text-xl font-black leading-none text-black">{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </span>
    </div>
  );
}

function RoutineCard({
  productType,
  id,
  kit,
  status,
  featured = false
}: {
  productType: VoiceFlexProduct;
  id: RoutineId;
  kit: VoiceFlexKit;
  status: RoutineStatus;
  featured?: boolean;
}) {
  const routine = ROUTINES[id];
  const minutes = formatSessionDuration(getRoutineTotalSeconds(id, kit));
  const skills = getRoutineSkills(id, kit);
  const href = `/train/${productType}?routine=${id}`;
  const actionLabel = status.complete ? "Do it again" : status.done > 0 ? "Continue" : "Start";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-blue-200",
        featured ? "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 md:p-7" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {featured ? <p className="text-xs font-black uppercase tracking-[0.16em] text-electric-700">Start here</p> : null}
          <h2 className={cn("font-black text-navy-950", featured ? "mt-1 text-3xl" : "text-xl")}>{routine.title}</h2>
        </div>
        {status.complete ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Done today
          </span>
        ) : status.done > 0 ? (
          <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
            {status.done}/{status.total} done
          </span>
        ) : null}
      </div>

      <p className={cn("mt-2 text-slate-600", featured ? "max-w-2xl text-base leading-7" : "text-sm leading-6")}>{routine.forWhen}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-electric-700" />
          {minutes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Gauge className="h-4 w-4 text-electric-700" />
          {routine.resistanceLabel}
        </span>
        <span>{status.total} steps</span>
      </div>

      {skills.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className={cn("rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide", SKILL_CHIP[skill])}>
              {SKILL_LABELS[skill]}
            </span>
          ))}
        </div>
      ) : null}

      <span
        className={cn(
          "mt-auto inline-flex items-center gap-2 pt-5 font-black text-electric-700",
          featured && "w-fit rounded-xl bg-electric-600 px-5 py-3 text-white group-hover:bg-electric-700"
        )}
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
