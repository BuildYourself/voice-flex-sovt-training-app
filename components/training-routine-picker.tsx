"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Check, ChevronDown, Clock, Flame, Gauge, Pencil, Plus, Shield, Timer } from "lucide-react";

import { ReviewRequest } from "@/components/review-request";
import { TrainingSidebar } from "@/components/training-sidebar";
import { useCustomLibrary } from "@/hooks/use-custom-library";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import {
  customRoutineParam,
  customRoutineSeconds,
  customRoutineSkills,
  playableSteps,
  type CustomRoutine,
  type UserLibrary
} from "@/lib/custom-library";
import { getExercise, getExerciseTitle } from "@/lib/exercises";
import { getDefaultKit, getKitProfile, type KitProfile, type VoiceFlexKit } from "@/lib/kits";
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
  const { progress, kit: storedKit, loading, routinesCompleted } = useTrainingProgress(productType);
  const kit: VoiceFlexKit = storedKit ?? getDefaultKit(productType);
  const kitProfile = getKitProfile(kit);
  const { library } = useCustomLibrary(productType);

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
                Start with the Daily Session. It&apos;s the everyday routine and covers the basics in one go.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Metric icon={<Flame className="h-6 w-6 text-orange-500" />} value={progress.streak} label="day streak" />
              <div className="h-10 w-px bg-slate-200" />
              <Metric icon={<Timer className="h-6 w-6 text-electric-700" />} value={progress.totalMinutes} label="total minutes" />
            </div>
          </header>


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
            <DailySessionHero productType={productType} id={featuredId} kit={kit} kitProfile={kitProfile} status={statusFor(featuredId)} />
          </section>

          {library.routines.length ? (
            <MyRoutines
              productType={productType}
              library={library}
              kit={kit}
              statusFor={(routine) => {
                const total = playableSteps(routine, library, kit).length;
                const done = (progress.completedExercises[getRoutineDayKey(routine.slot)] ?? []).length;
                return { done: Math.min(done, total), total, complete: total > 0 && done >= total };
              }}
            />
          ) : null}

          <AdvancedRoutines productType={productType} ids={otherIds} kit={kit} statusFor={statusFor} hasTrained={progress.totalMinutes > 0} />

          {/* The review ask waits until they've finished a routine. */}
          {routinesCompleted && routinesCompleted > 0 ? (
            <section className="mt-8">
              <ReviewRequest productType={productType} />
            </section>
          ) : null}

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

function actionLabelFor(status: RoutineStatus) {
  return status.complete ? "Do it again" : status.done > 0 ? "Continue" : "Start";
}

function DailySessionHero({
  productType,
  id,
  kit,
  kitProfile,
  status
}: {
  productType: VoiceFlexProduct;
  id: RoutineId;
  kit: VoiceFlexKit;
  kitProfile: KitProfile;
  status: RoutineStatus;
}) {
  const routine = ROUTINES[id];
  const minutes = formatSessionDuration(getRoutineTotalSeconds(id, kit));
  const skills = getRoutineSkills(id, kit);
  const steps = resolveRoutineSteps(id, kit);
  const href = `/train/${productType}?routine=${id}`;
  const action = status.complete ? "Do it again" : status.done > 0 ? "Continue the Daily Session" : "Start the Daily Session";

  return (
    <div className="grid gap-6 rounded-[28px] border-2 border-electric-600/30 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-card md:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-10">
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-electric-600 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white">Start here</span>
          {status.complete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              Done today
            </span>
          ) : status.done > 0 ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
              {status.done}/{status.total} done
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 text-4xl font-black leading-tight text-navy-950 md:text-5xl">{routine.title}</h2>
        <p className="mt-3 max-w-xl text-lg leading-8 text-slate-600">{routine.forWhen}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-base font-bold text-slate-700">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-5 w-5 text-electric-700" />
            {minutes}
          </span>
          <span className="inline-flex items-center gap-2">
            <Gauge className="h-5 w-5 text-electric-700" />
            {routine.resistanceLabel}
          </span>
          <span>{status.total} steps</span>
        </div>

        {skills.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className={cn("rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide", SKILL_CHIP[skill])}>
                {SKILL_LABELS[skill]}
              </span>
            ))}
          </div>
        ) : null}

        <Link
          href={href}
          className="group mt-7 inline-flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-electric-600 px-8 text-lg font-black text-white shadow-[0_12px_30px_-12px_rgba(23,107,255,0.8)] transition hover:bg-electric-700 sm:w-fit"
        >
          {action}
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
        </Link>

        <p className="mt-5 text-sm leading-6 text-slate-500">
          Written for <span className="font-black text-navy-950">{kitProfile.name}</span>, with {kitProfile.contents}.
        </p>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-white/90 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">What you&apos;ll do</p>
        <ol className="mt-3 divide-y divide-slate-100">
          {steps.map((step, index) => {
            const exercise = getExercise(step.exercise);
            return (
              <li key={`${step.exercise}-${index}`} className="flex items-center gap-3 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-electric-700">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate font-bold text-navy-950">{exercise ? getExerciseTitle(exercise, kitProfile) : step.exercise}</span>
                <span className="shrink-0 text-sm font-bold text-slate-500">{formatSessionDuration(step.seconds)}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function MyRoutines({
  productType,
  library,
  kit,
  statusFor
}: {
  productType: VoiceFlexProduct;
  library: UserLibrary;
  kit: VoiceFlexKit;
  statusFor: (routine: CustomRoutine) => RoutineStatus;
}) {
  return (
    <section className="mt-12" aria-labelledby="my-routines-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="my-routines-title" className="text-2xl font-black text-navy-950">My routines</h2>
          <p className="mt-1 text-base leading-7 text-slate-600">The routines you built yourself.</p>
        </div>
        <Link
          href={`/train/${productType}/routines`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-electric-700"
        >
          <Plus className="h-4 w-4" />
          New routine
        </Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {library.routines.map((routine) => {
          const status = statusFor(routine);
          const skills = customRoutineSkills(routine, library, kit);
          return (
            <div key={routine.id} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words text-xl font-black text-navy-950">{routine.title}</h3>
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
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-electric-700" />
                  {formatSessionDuration(customRoutineSeconds(routine, library, kit))}
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
              <div className="mt-auto flex items-center gap-2 pt-5">
                {status.total > 0 ? (
                  <Link
                    href={`/train/${productType}?routine=${customRoutineParam(routine.id)}`}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-electric-600 px-4 text-sm font-black text-white hover:bg-electric-700"
                  >
                    {actionLabelFor(status)}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="text-sm text-slate-500">No exercises for your kit</span>
                )}
                <Link
                  href={`/train/${productType}/routines?id=${routine.id}`}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-black text-slate-600 hover:text-electric-700"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const ADVANCED_OPEN_KEY = "voiceflex_advanced_routines_open";

function AdvancedRoutines({
  productType,
  ids,
  kit,
  statusFor,
  hasTrained
}: {
  productType: VoiceFlexProduct;
  ids: RoutineId[];
  kit: VoiceFlexKit;
  statusFor: (id: RoutineId) => RoutineStatus;
  hasTrained: boolean;
}) {
  // New people see the Daily Session on its own. The advanced routines open by themselves once
  // someone has trained, and a click to open or close them is remembered on this device.
  const [choice, setChoice] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADVANCED_OPEN_KEY);
      if (saved === "1" || saved === "0") setChoice(saved === "1");
    } catch {
      // Storage blocked: fall back to the default.
    }
  }, []);
  const open = choice ?? hasTrained;
  const toggle = () => {
    const next = !open;
    setChoice(next);
    try {
      window.localStorage.setItem(ADVANCED_OPEN_KEY, next ? "1" : "0");
    } catch {
      // Storage blocked: the choice lasts for this visit.
    }
  };

  return (
    <section className="mt-12 border-t border-slate-200 pt-8" aria-labelledby="advanced-routines-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="advanced-routines-title" className="text-2xl font-black text-navy-950">Advanced routines</h2>
          <p className="mt-1 max-w-2xl text-base leading-7 text-slate-600">
            Shorter or more focused routines. Try them once the Daily Session feels easy.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="advanced-routines-list"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:text-electric-700"
        >
          {open ? "Hide" : `Show all ${ids.length}`}
          <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <div id="advanced-routines-list" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ids.map((id) => (
            <RoutineCard key={id} productType={productType} id={id} kit={kit} status={statusFor(id)} />
          ))}
          <Link
            href={`/train/${productType}/routines`}
            className="group flex h-full min-h-[200px] flex-col justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-white/60 p-5 transition hover:border-electric-600"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-electric-700">
              <Plus className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-xl font-black text-navy-950">Build your own routine</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Pick exercises from the library and set the time and resistance for each one.</p>
          </Link>
        </div>
      ) : null}
    </section>
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
  status
}: {
  productType: VoiceFlexProduct;
  id: RoutineId;
  kit: VoiceFlexKit;
  status: RoutineStatus;
}) {
  const routine = ROUTINES[id];
  const minutes = formatSessionDuration(getRoutineTotalSeconds(id, kit));
  const skills = getRoutineSkills(id, kit);
  const href = `/train/${productType}?routine=${id}`;
  const actionLabel = actionLabelFor(status);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-blue-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-navy-950">{routine.title}</h3>
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

      <p className="mt-2 text-sm leading-6 text-slate-600">{routine.forWhen}</p>

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

      <span className="mt-auto inline-flex items-center gap-2 pt-5 font-black text-electric-700">
        {actionLabel}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
