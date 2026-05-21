"use client";

import Link from "next/link";
import type React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarDays, Check, Circle, Clock, Flame, Heart, Lock, Play, Sparkles, Star, Trophy, Waves } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingerVisual } from "@/components/visuals";
import { improvements, programs } from "@/lib/mock-data";
import type { DbExercise } from "@/lib/programs-client";
import { cn } from "@/lib/utils";
import { useState } from "react";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 }
};

export function HeroCard({ currentDay, durationDays }: { currentDay: number; durationDays: number }) {
  const percent = Math.max(1, Math.min(100, Math.round((currentDay / Math.max(1, durationDays)) * 100)));
  return (
    <motion.section
      {...fade}
      className="relative min-h-[350px] overflow-hidden rounded-[20px] bg-[linear-gradient(90deg,rgba(6,42,88,0.98)_0%,rgba(5,74,160,0.95)_45%,rgba(3,20,42,0.88)_100%)] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:p-10 lg:min-h-[352px] lg:p-12"
    >
      <img
        src="/images/voice-flex-hero-singer.jpg"
        alt="Singer recording with microphone"
        className="absolute inset-y-0 right-0 object-cover object-[68%_center] opacity-55 sm:opacity-80 lg:left-auto lg:w-[50%] lg:opacity-100"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,20,42,0.18)_0%,rgba(3,20,42,0.05)_45%,rgba(3,20,42,0.42)_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[56%] bg-[linear-gradient(90deg,rgba(5,47,105,0.95)_0%,rgba(5,47,105,0.45)_35%,rgba(5,47,105,0.05)_70%)] lg:block" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,20,42,0.18)_0%,rgba(3,20,42,0.12)_48%,rgba(3,20,42,0.02)_100%)] lg:hidden" />

      <div className="relative z-10 max-w-[620px]">
        <h2 className="max-w-[520px] text-[30px] font-extrabold leading-[1.12] tracking-[-0.02em] text-white sm:text-[34px] lg:text-[36px]">
          Your guided path from
          <br className="hidden sm:block" />
          first note to confident voice
        </h2>
        <p className="mt-6 text-base font-medium leading-6 text-white/95">Follow the system. Do the work. See the change.</p>

        <div className="mt-12 flex flex-col gap-7 lg:flex-row lg:items-center">
          <Button asChild className="h-[52px] w-fit rounded-xl bg-white px-6 text-base font-bold text-[#0b5fea] shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:bg-blue-50">
            <Link href="/session">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1665e8] text-white">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
              Start Today&apos;s Session
            </Link>
          </Button>

          <div className="hidden h-[70px] w-px bg-white/30 lg:block" />

          <div className="w-full min-w-0 max-w-[390px]">
            <p className="text-sm font-semibold text-white/90">21-Day Transformation Program</p>
            <p className="mt-2 text-[23px] font-extrabold leading-tight text-white">Day {currentDay} of {durationDays}</p>
            <div className="mt-4 flex items-center gap-6">
              <div className="h-3 w-full max-w-[310px] overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-[#5ce1e6]" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-sm font-bold text-white">{percent}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function StatCard({ icon, value, label, detail, tone }: { icon: React.ReactNode; value: string; label: string; detail: string; tone: string }) {
  return (
    <div className={cn("rounded-2xl p-4 sm:p-5", tone)}>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/60 sm:h-14 sm:w-14">{icon}</div>
      <p className="mt-5 text-3xl font-black leading-none text-black sm:text-[34px]">{value}</p>
      <p className="mt-2 text-base font-bold text-slate-900">{label}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

export function StatsGrid({ dayStreak, totalMinutes, sessionsCompleted, nextMilestoneDay, nextMilestoneLabel }: { dayStreak: number; totalMinutes: number; sessionsCompleted: number; nextMilestoneDay: number; nextMilestoneLabel: string }) {

  return (
    <Card className="p-3 sm:p-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard icon={<Flame className="h-7 w-7 text-emerald-700" />} value={String(dayStreak)} label="Day Streak" detail="Keep it going!" tone="bg-emerald-50" />
        <StatCard icon={<Clock className="h-7 w-7 text-electric-700" />} value={String(totalMinutes)} label="Total Minutes" detail="Great progress!" tone="bg-blue-50" />
        <StatCard icon={<BadgeCheck className="h-7 w-7 text-purple-700" />} value={String(sessionsCompleted)} label="Sessions Completed" detail="You're building momentum." tone="bg-purple-50" />
        <StatCard icon={<Trophy className="h-7 w-7 text-amber-700" />} value={`Day ${nextMilestoneDay}`} label="Next Milestone" detail={nextMilestoneLabel} tone="bg-amber-50" />
      </div>
    </Card>
  );
}

const exerciseTone: Record<string, string> = {
  Breathing: "bg-emerald-100 text-emerald-700",
  "Warm-Up": "bg-teal-100 text-teal-700",
  Technique: "bg-blue-100 text-blue-700",
  Tone: "bg-purple-100 text-purple-700",
  Recovery: "bg-pink-100 text-pink-700"
};

function mapExerciseType(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("bubble") || lower.includes("mmm")) return "Warm-Up";
  if (lower.includes("siren") || lower.includes("notes") || lower.includes("arpeggio")) return "Technique";
  if (lower.includes("voice check")) return "Recovery";
  return "Breathing";
}

function durationLabel(displayDuration: string | null, durationSeconds: number) {
  if (displayDuration) return displayDuration;
  const minutes = durationSeconds / 60;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}

export function TodayPlan({
  initialExercises,
  initialEstimatedMinutes
}: {
  initialExercises: DbExercise[];
  initialEstimatedMinutes: number | null;
}) {
  const [exercises, setExercises] = useState<DbExercise[]>(initialExercises);
  const [loadMessage] = useState<string | null>(null);

  const estimatedMinutes = initialEstimatedMinutes ?? exercises.reduce((sum, item) => sum + item.duration_seconds / 60, 0);
  const visibleExercises = exercises.slice(0, 5);

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-electric-600" />
          <CardTitle>Today&apos;s Plan</CardTitle>
        </div>
        <span className="text-sm text-slate-500">Est. {Math.max(1, Math.round(estimatedMinutes))} min</span>
      </CardHeader>
      <CardContent className="p-0">
        {visibleExercises.map((exercise, index) => {
          const type = mapExerciseType(exercise.title);
          return (
            <Link
              key={exercise.id}
              href="/session"
              className="grid min-h-[72px] grid-cols-[30px_44px_1fr] items-center gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 sm:grid-cols-[32px_48px_1fr_auto] sm:px-5"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">{index + 1}</span>
              <span className={cn("grid h-11 w-11 place-items-center rounded-xl sm:h-12 sm:w-12", exerciseTone[type])}>
                {type === "Recovery" ? <Heart className="h-5 w-5" /> : <Waves className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="font-bold">{exercise.title}</p>
                <p className="text-sm text-slate-500">
                  {type} • {durationLabel(exercise.display_duration, exercise.duration_seconds)}
                </p>
              </div>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Play className="h-3.5 w-3.5 fill-current" />
                Start
              </Button>
            </Link>
          );
        })}
        {exercises.length === 0 && <div className="px-5 py-6 text-sm text-slate-600">{loadMessage ?? "No exercises found for this day."}</div>}
        <Link href="/programs" className="flex items-center gap-3 px-5 py-4 font-bold text-electric-700">
          View full plan <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

const roadItems = [
  { name: "Point A", desc: "Where you are now", icon: Circle, status: "done" },
  { name: "Foundations", desc: "Build strong basics", icon: Check, status: "done" },
  { name: "Control", desc: "Gain control & consistency", icon: Circle, status: "current" },
  { name: "Range", desc: "Expand your range", icon: Lock, status: "locked" },
  { name: "Confidence", desc: "Perform with ease", icon: Lock, status: "locked" },
  { name: "Point B", desc: "Your best voice", icon: Star, status: "future" }
];

export function Roadmap({ wide = false }: { wide?: boolean }) {
  return (
    <Card className="mini-wave">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-slate-600" />
          <CardTitle>{wide ? "Your Transformation Roadmap" : "Road to Better Singing"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", wide ? "grid-cols-2 md:grid-cols-4 xl:grid-cols-7" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-6")}>
          {(wide
            ? [...roadItems.slice(0, 5), { name: "Performance", desc: "Deliver your best voice anywhere.", icon: Star, status: "future" }, roadItems[5]]
            : roadItems
          ).map((item, index, array) => {
            const Icon = item.icon;
            const current = item.status === "current";
            const complete = item.status === "done";
            return (
              <div key={item.name} className="relative text-center">
                {index < array.length - 1 && <div className={cn("absolute left-1/2 right-[-50%] top-6 hidden h-0.5 bg-slate-200 xl:block", (complete || current) && "bg-electric-500")} />}
                <div
                  className={cn(
                    "relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full border-2 bg-white text-slate-400 sm:h-14 sm:w-14",
                    complete && "border-emerald-300 bg-emerald-500 text-white",
                    current && "border-electric-500 bg-electric-600 text-white shadow-lg shadow-blue-200 sm:h-16 sm:w-16"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className={cn("mt-3 font-bold", current && "text-electric-700", complete && "text-emerald-700")}>{item.name}</p>
                <p className="mx-auto mt-1 max-w-[110px] text-sm leading-5 text-slate-600">{item.desc}</p>
                {current && <span className="mt-2 inline-flex rounded-full border border-electric-300 px-3 py-1 text-xs font-bold text-electric-700">CURRENT</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-7 rounded-xl border border-electric-200 bg-electric-50/70 px-6 py-4 text-sm text-navy-800">
          <Sparkles className="mr-3 inline h-5 w-5 text-electric-600" />
          {wide ? (
            <>
              Start at <b className="text-electric-700">Control</b> to build consistency and technique - the fastest path to visible results.
            </>
          ) : (
            <>
              <b>You&apos;re in Control</b>
              <br />
              This phase is all about consistency and technique. You&apos;ll build the skills that make everything else possible.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CoachTipCard() {
  return (
    <Card className="mini-wave">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-electric-600" />
          <CardTitle>Coach Guidance</CardTitle>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-rose-100 to-amber-100 font-bold text-slate-700">VC</div>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl bg-blue-50/80 p-5">
          <p className="mb-3 font-bold text-electric-700">What to focus on today</p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>Support your breath from your lower ribs.</li>
            <li>Keep your tone easy and relaxed.</li>
            <li>Listen for steady pitch and smooth tone.</li>
          </ul>
          <div className="my-5 h-px bg-slate-200" />
          <p className="font-bold text-electric-700">Daily mantra</p>
          <p className="mt-2 font-semibold italic text-navy-800">&quot;Small, consistent steps create unshakable confidence.&quot;</p>
          <p className="mt-2 text-sm text-slate-500">- Your Voice Coach</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgramsStrip() {
  const colors = ["bg-purple-50 text-purple-800", "bg-emerald-50 text-emerald-800", "bg-pink-50 text-pink-800", "bg-blue-50 text-blue-800"];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Programs</CardTitle>
        <Link href="/programs" className="text-sm font-bold text-electric-700">
          View all
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {programs.slice(0, 4).map((program, index) => (
          <div key={program.id} className={cn("rounded-xl p-4", colors[index])}>
            <p className="text-sm font-bold">{program.title}</p>
            <p className="mt-1 text-xs text-slate-600">{program.durationDays} Days</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentWins() {
  const data = improvements[0].data.map((value, index) => ({ index, value }));
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <CardTitle>Recent Wins</CardTitle>
        </div>
        <Link href="/progress" className="text-sm font-bold text-electric-700">
          View all
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 place-items-center rounded-full border-[7px] border-emerald-300 text-xl font-black text-emerald-700">+23%</div>
        <div className="flex-1">
          <p className="text-lg font-bold">Pitch Control</p>
          <p className="text-sm text-slate-600">Your pitch stability improved by 23% this week!</p>
        </div>
        <div className="h-20 w-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeatureMarketingCard() {
  return (
    <Card className="relative min-h-[254px] overflow-hidden bg-[linear-gradient(135deg,#062d63_0%,#001b3c_100%)] p-0 text-white">
      <div className="relative z-10 max-w-[360px] p-7">
        <h3 className="text-3xl font-black leading-tight">
          Not just a straw.
          <br />A complete system.
        </h3>
        <p className="mt-5 text-sm leading-6 text-white/86">Voice Flex gives you the roadmap, the tools, and the guidance to transform your voice - step by step.</p>
        <ul className="mt-5 space-y-3 text-sm">
          <li className="flex gap-2">
            <Check className="h-5 w-5 text-cyan-300" />
            Guided programs
          </li>
          <li className="flex gap-2">
            <Check className="h-5 w-5 text-cyan-300" />
            Scientifically informed
          </li>
          <li className="flex gap-2">
            <Check className="h-5 w-5 text-cyan-300" />
            Built for real results
          </li>
        </ul>
      </div>
      <SingerVisual compact />
    </Card>
  );
}

export function TinyWaveLogo() {
  return <Waves className="h-6 w-6 text-electric-600" />;
}


