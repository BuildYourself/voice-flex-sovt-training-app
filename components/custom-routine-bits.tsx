"use client";

import { Minus, Plus } from "lucide-react";

import type { ExerciseSkill } from "@/lib/exercises";
import type { ResistanceLevel } from "@/lib/kits";
import { LIBRARY_LIMITS, type LevelOption } from "@/lib/custom-library";
import { SKILL_LABELS } from "@/lib/routines";
import { cn } from "@/lib/utils";

/** Small pieces shared by the exercise library, the routine editor and the routine picker. */

export const SKILL_CHIP: Record<ExerciseSkill, string> = {
  breath: "bg-cyan-50 text-cyan-700",
  flexibility: "bg-blue-50 text-electric-700",
  pitch: "bg-violet-50 text-violet-700",
  speaking: "bg-emerald-50 text-emerald-700"
};

export function SkillChips({ skills, className }: { skills: ExerciseSkill[]; className?: string }) {
  if (!skills.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {skills.map((skill) => (
        <span key={skill} className={cn("rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide", SKILL_CHIP[skill])}>
          {SKILL_LABELS[skill]}
        </span>
      ))}
    </div>
  );
}

export function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Minus / time / plus, in 15-second steps. */
export function TimeStepper({
  seconds,
  onChange,
  label = "Time"
}: {
  seconds: number;
  onChange: (seconds: number) => void;
  label?: string;
}) {
  const { minSeconds, maxSeconds, secondsStep } = LIBRARY_LIMITS;
  const change = (delta: number) => onChange(Math.min(maxSeconds, Math.max(minSeconds, seconds + delta)));
  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => change(-secondsStep)}
        disabled={seconds <= minSeconds}
        aria-label={`Shorter by ${secondsStep} seconds`}
        className="grid h-full w-10 place-items-center rounded-l-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[56px] text-center font-black tabular-nums text-navy-950" aria-live="polite">
        {formatClock(seconds)}
      </span>
      <button
        type="button"
        onClick={() => change(secondsStep)}
        disabled={seconds >= maxSeconds}
        aria-label={`Longer by ${secondsStep} seconds`}
        className="grid h-full w-10 place-items-center rounded-r-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/** The resistance choices this kit has, by their real names. Hidden when the kit has only one. */
export function LevelSelect({
  value,
  options,
  onChange,
  label = "Resistance"
}: {
  value: ResistanceLevel;
  options: LevelOption[];
  onChange: (level: ResistanceLevel) => void;
  label?: string;
}) {
  if (options.length < 2) return null;
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as ResistanceLevel)}
      className="h-11 min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-navy-950 focus:border-electric-600 focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.level} value={option.level}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
