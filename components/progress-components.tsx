"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Edit3, Flame, Plus, Star, Trophy, Zap } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SingerVisual } from "@/components/visuals";
import { improvements } from "@/lib/mock-data";
import {
  addJournalEntry,
  defaultProgress,
  getCalendarDays,
  getJournalEntries,
  getProgress,
  progressPercent,
  type VoiceFlexProgress
} from "@/lib/storage";
import type { CalendarDay, JournalEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProgressStatCards() {
  const [progress, setProgressState] = useState<VoiceFlexProgress>(defaultProgress);
  useEffect(() => setProgressState(getProgress()), []);
  const percent = progressPercent(progress);
  const stats = [
    { title: "Your Streak", value: String(progress.dayStreak), unit: "day streak", icon: <Flame className="h-8 w-8 text-red-500" />, bg: "bg-red-50" },
    { title: "Sessions Completed", value: String(progress.sessionsCompleted), unit: "sessions", icon: <Check className="h-8 w-8 text-purple-700" />, bg: "bg-purple-50" },
    { title: "Total Minutes", value: String(progress.totalMinutes), unit: "minutes", icon: <Clock className="h-8 w-8 text-electric-700" />, bg: "bg-blue-50" }
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="flex gap-5 p-7">
            <span className={cn("grid h-14 w-14 place-items-center rounded-full", stat.bg)}>{stat.icon}</span>
            <div>
              <p className="font-semibold text-slate-700">{stat.title}</p>
              <p className="mt-3 text-5xl font-black">{stat.value}</p>
              <p className="text-lg font-medium">{stat.unit}</p>
              <p className="mt-4 text-slate-600">{stat.title === "Your Streak" ? "Keep it going!" : stat.title === "Sessions Completed" ? "You're building momentum." : "Great progress!"}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="p-7">
          <div className="flex gap-5">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50"><Zap className="h-8 w-8 text-emerald-500" /></span>
            <div className="flex-1">
              <p className="font-semibold text-slate-700">Program Progress</p>
              <p className="mt-3 text-3xl font-black">Day {progress.currentDay} <span className="text-2xl font-semibold">of {progress.durationDays}</span></p>
              <div className="mt-6 flex justify-between text-sm text-slate-500"><span>{percent}% complete</span><span>{percent}%</span></div>
              <Progress value={percent} className="mt-3" indicatorClassName="bg-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export function ProgressCalendar({ interactive = false }: { interactive?: boolean }) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [selected, setSelected] = useState(defaultProgress.currentDay);

  useEffect(() => {
    setDays(getCalendarDays());
    setSelected(getProgress().currentDay);
  }, []);

  const renderedDays = days.length ? days : getCalendarDays();
  const selectedDay = renderedDays.find((item) => item.day === selected);
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{interactive ? "Training Calendar" : "June 2025"}</CardTitle>
        <div className="flex gap-5 text-2xl text-slate-500"><span>{"<"}</span><span>{">"}</span></div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-y-5 text-center">
          {labels.map((label) => <span key={label} className="text-sm font-semibold text-slate-700">{label}</span>)}
          {renderedDays.map((day, index) => (
            <button
              key={`${day.day}-${index}`}
              disabled={!day.day}
              onClick={() => day.day && setSelected(day.day)}
              className="mx-auto grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition hover:scale-105 disabled:opacity-20"
            >
              <span className={cn(
                "grid h-8 w-8 place-items-center rounded-full border border-transparent",
                day.status === "completed" && "bg-emerald-500 text-white",
                day.status === "today" && "bg-electric-600 text-white ring-4 ring-blue-100",
                day.status === "planned" && "border-slate-300 text-slate-400",
                day.status === "rest" && "bg-slate-200 text-slate-500",
                day.status === "milestone" && "text-electric-700"
              )}>
                {day.status === "milestone" ? <Star className="h-5 w-5" /> : day.day || ""}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-600">
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-emerald-500" />Completed</span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-electric-600" />Today</span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border border-slate-300" />Planned</span>
          <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-slate-200" />Rest / Skipped</span>
          <span className="flex items-center gap-2"><Star className="h-4 w-4 text-electric-600" />Milestone</span>
        </div>
        {interactive && selectedDay && (
          <div className="mt-7 rounded-2xl bg-blue-50 p-5">
            <p className="text-lg font-bold">June {selected}</p>
            <p className="mt-2 capitalize text-slate-600">Status: {selectedDay.status}</p>
            <p className="mt-1 text-slate-600">Minutes practiced: {selectedDay.minutes ?? 0}</p>
            <p className="mt-4 font-semibold">Exercises</p>
            <p className="text-sm text-slate-600">{selectedDay.exercises?.join(", ") || "No exercises logged yet."}</p>
            <p className="mt-4 font-semibold">Journal notes</p>
            <p className="text-sm text-slate-600">{selectedDay.notes || "No notes yet."}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProgramProgressRoadmap() {
  const [progress, setProgressState] = useState<VoiceFlexProgress>(defaultProgress);
  useEffect(() => setProgressState(getProgress()), []);
  const percent = progressPercent(progress);
  const phases = [
    ["Foundations", "Days 1-4", "Solid start", progress.currentDay > 4 ? "done" : "current"],
    ["Control", "Days 5-10", "Building consistency", progress.currentDay > 10 ? "done" : progress.currentDay >= 5 ? "current" : "locked"],
    ["Range", "Days 11-15", "Expanding range", progress.currentDay > 15 ? "done" : progress.currentDay >= 11 ? "current" : "locked"],
    ["Confidence", "Days 16-19", "Perform with ease", progress.currentDay > 19 ? "done" : progress.currentDay >= 16 ? "current" : "locked"],
    ["Point B", "Days 20-21", "Your best voice", progress.currentDay >= 20 ? "current" : "locked"]
  ];

  return (
    <Card className="mini-wave">
      <CardHeader>
        <div>
          <CardTitle>21-Day Transformation Program</CardTitle>
          <p className="mt-4 text-3xl font-black">Day {progress.currentDay} <span className="text-xl font-semibold">of {progress.durationDays}</span></p>
        </div>
        <span className="text-slate-500">{percent}%</span>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="h-4" indicatorClassName="bg-emerald-500" />
        <div className="mt-8 grid grid-cols-5 gap-2 text-center">
          {phases.map(([name, daysLabel, desc, status]) => (
            <div key={name}>
              <span className={cn("mx-auto grid h-9 w-9 place-items-center rounded-full border-2 bg-white", status === "done" && "border-emerald-500 bg-emerald-500 text-white", status === "current" && "border-electric-600 text-electric-700 ring-4 ring-blue-100", status === "locked" && "text-slate-400")}>
                {status === "done" ? <Check className="h-5 w-5" /> : status === "locked" ? "L" : ""}
              </span>
              <p className="mt-3 font-bold">{name}</p>
              <p className="mt-1 text-sm text-slate-500">{daysLabel}</p>
              <p className={cn("mt-1 text-sm text-slate-600", status === "current" && "text-electric-700")}>{desc}</p>
              {status === "current" && <span className="mt-3 inline-flex rounded-full border border-electric-300 px-3 py-1 text-xs font-bold text-electric-700">CURRENT</span>}
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-electric-200 bg-electric-50 px-6 py-4 text-sm text-navy-800">
          <Star className="mr-3 inline h-5 w-5 text-electric-600" />
          <b>You're on Day {progress.currentDay}</b><br />Keep exploring your voice with ease and control. Consistency is creating freedom.
        </div>
      </CardContent>
    </Card>
  );
}

export function JournalCard() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  useEffect(() => setEntries(getJournalEntries()), []);

  const onAddEntry = () => {
    const body = window.prompt("New journal entry", "My voice felt steady and relaxed today.");
    if (!body) return;
    addJournalEntry(body);
    setEntries(getJournalEntries());
  };

  const renderedEntries = entries.length ? entries : getJournalEntries();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3"><Edit3 className="h-5 w-5 text-electric-600" /><CardTitle>Voice Journal</CardTitle></div>
        <span className="text-sm font-bold text-electric-700">View all</span>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl bg-blue-50">
          {renderedEntries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="flex gap-4 border-b border-slate-200 p-4 last:border-0">
              <Edit3 className="mt-1 h-6 w-6 text-electric-600" />
              <div>
                <p className="font-medium leading-6">{entry.body}</p>
                <p className="mt-1 text-sm text-slate-500">{entry.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onAddEntry} variant="outline" className="mt-4 w-full"><Plus className="h-4 w-4" />New Journal Entry</Button>
      </CardContent>
    </Card>
  );
}

export function ImprovementChart({ item }: { item: (typeof improvements)[number] }) {
  const data = item.data.map((value, index) => ({ index, value }));
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <p className="font-bold">{item.title}</p>
      <p className="mt-3 text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
      <p className="text-sm text-slate-500">vs last 7 days</p>
      <div className="mt-3 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={item.color} strokeWidth={2} dot={{ r: 2, fill: item.color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RecentImprovements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Improvements</CardTitle>
        <span className="text-sm font-bold text-electric-700">View details</span>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        {improvements.map((item) => <ImprovementChart key={item.title} item={item} />)}
      </CardContent>
    </Card>
  );
}

export function AchievementList() {
  const [progress, setProgressState] = useState<VoiceFlexProgress>(defaultProgress);
  useEffect(() => setProgressState(getProgress()), []);
  const achievementData = [
    { id: "first-step", title: "First Step", description: "Complete 1 session", icon: Trophy, color: "bg-blue-100 text-electric-600" },
    { id: "early-momentum", title: "Early Momentum", description: "Complete 5 sessions", icon: Zap, color: "bg-emerald-100 text-emerald-600" },
    { id: "consistent-streak", title: "Consistent Streak", description: "Complete 7 days in a row", icon: Trophy, color: "bg-amber-100 text-amber-600" },
    { id: "halfway-hero", title: "Halfway Hero", description: "Reach Day 10", icon: Star, color: "bg-orange-100 text-orange-500" },
    { id: "point-b-reached", title: "Point B Reached", description: "Complete 21 days", icon: Star, color: "bg-purple-100 text-purple-600" }
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Achievements</CardTitle><span className="text-sm font-bold text-electric-700">View all</span></CardHeader>
      <CardContent className="space-y-5">
        {achievementData.map((item) => {
          const Icon = item.icon;
          const unlocked = progress.achievements.includes(item.id);
          return (
            <div key={item.id} className="flex items-center gap-4">
              <span className={cn("grid h-10 w-10 place-items-center rounded-full", unlocked ? item.color : "bg-slate-100 text-slate-400")}><Icon className="h-5 w-5" /></span>
              <div className="flex-1"><p className="font-bold">{item.title}</p><p className="text-sm text-slate-500">{item.description}</p></div>
              <span className={cn("rounded-lg px-3 py-1 text-sm font-bold", unlocked ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>{unlocked ? "Unlocked" : "Locked"}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function RecommendedSession() {
  return (
    <Card>
      <CardHeader><CardTitle>Recommended Next Session</CardTitle></CardHeader>
      <CardContent className="flex gap-6">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl"><SingerVisual compact /></div>
        <div>
          <h3 className="text-xl font-bold">Range Builder - Upper Extension</h3>
          <p className="mt-3 text-lg">25 min</p>
          <p className="mt-2 text-slate-600">Expand your upper range with control and ease.</p>
          <Button className="mt-6 w-full"><PlayIcon />Start Session</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PlayIcon() {
  return <span className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-xs">▶</span>;
}
