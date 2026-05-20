"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Clock, Maximize, Pause, Play, SkipBack, SkipForward, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Waveform } from "@/components/visuals";
import { sessionSteps, todayExercises } from "@/lib/mock-data";
import { completeSession } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function SessionTimeline({ currentIndex, completedSteps }: { currentIndex: number; completedSteps: number[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Session Flow</CardTitle>
        <span className="text-sm text-slate-500">5 Steps</span>
      </CardHeader>
      <CardContent className="space-y-5">
        {sessionSteps.map((step, index) => {
          const completed = completedSteps.includes(index);
          const current = index === currentIndex;
          return (
            <motion.div layout key={step.id} className={cn("relative grid grid-cols-[48px_1fr] gap-4 rounded-2xl p-3", current && "border border-electric-500 bg-electric-50")}>
              {index < sessionSteps.length - 1 && <div className={cn("absolute left-[36px] top-14 h-14 border-l-2 border-dashed border-slate-300", completed && "border-emerald-400")} />}
              <div className={cn("relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-300 text-lg font-bold text-white", completed && "bg-emerald-500", current && "bg-electric-600")}>
                {completed ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div>
                <p className={cn("font-bold", current && "text-electric-700")}>{step.title}</p>
                <p className={cn("mt-1 text-sm text-slate-500", current && "font-semibold text-electric-700")}>{index === currentIndex ? `${step.durationMinutes} min • Current` : `${step.durationMinutes} min`}</p>
              </div>
            </motion.div>
          );
        })}
        <Button variant="outline" className="mt-8 w-full justify-between">View full plan <SkipForward className="h-4 w-4" /></Button>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function ExerciseTimer({ currentIndex, onNext, onPrevious, onMinuteEarned }: { currentIndex: number; onNext: () => void; onPrevious: () => void; onMinuteEarned: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(5 * 60);
  const exercise = todayExercises[currentIndex] ?? todayExercises[1];
  const progress = ((5 * 60 - remaining) / (5 * 60)) * 100;

  useEffect(() => {
    setRemaining(5 * 60);
    setIsRunning(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          setIsRunning(false);
          onMinuteEarned();
          onNext();
          return 5 * 60;
        }
        if (value % 60 === 0) onMinuteEarned();
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, onMinuteEarned, onNext]);

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      <CardContent className="p-8">
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div>
            <div className="flex items-center gap-3 text-slate-700">
              <Waves className="h-7 w-7 text-electric-600" />
              <span className="font-semibold">Current Exercise</span>
            </div>
            <h2 className="mt-8 text-5xl font-black tracking-normal">{exercise.id === "lip-trill" ? "Lip Trill Flow" : exercise.title}</h2>
            <p className="mt-4 max-w-[400px] text-lg leading-7 text-slate-600">{exercise.description}</p>
            <span className="mt-5 inline-flex rounded-lg bg-electric-100 px-4 py-2 font-bold text-electric-700">Step {currentIndex + 1} of 5</span>
            <Waveform className="mt-9" />
          </div>
          <div className="relative grid place-items-center">
            <Maximize className="absolute right-0 top-0 h-6 w-6 text-slate-500" />
            <div className="relative grid h-64 w-64 place-items-center rounded-full bg-white">
              <div className="absolute inset-0 rounded-full border-[18px] border-blue-200" />
              <div className="absolute inset-0 rounded-full border-[18px] border-electric-600" style={{ clipPath: `polygon(50% 50%, 50% 0, ${50 + progress / 2}% 0, 100% 50%, 50% 50%)` }} />
              <div className="relative text-center">
                <p className="text-5xl font-black">{formatTime(remaining)}</p>
                <p className="mt-2 text-slate-600">Remaining</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 grid max-w-[690px] grid-cols-3 items-center rounded-full border border-blue-100 bg-white p-2 shadow-soft">
          <button onClick={onPrevious} className="flex flex-col items-center justify-center gap-1 rounded-full py-4 text-slate-700 hover:bg-slate-50">
            <SkipBack className="h-5 w-5" />
            <span className="text-sm">Previous</span>
          </button>
          <button onClick={() => setIsRunning((value) => !value)} className="mx-auto -my-7 grid h-24 w-24 place-items-center rounded-full border-[8px] border-white bg-electric-600 text-white shadow-xl shadow-blue-300">
            {isRunning ? <Pause className="h-9 w-9 fill-current" /> : <Play className="h-9 w-9 fill-current" />}
          </button>
          <button onClick={onNext} className="flex flex-col items-center justify-center gap-1 rounded-full py-4 text-slate-700 hover:bg-slate-50">
            <SkipForward className="h-5 w-5" />
            <span className="text-sm">Skip Step</span>
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-600">{isRunning ? "Pause Exercise" : "Start Exercise"}</p>
      </CardContent>
    </Card>
  );
}

export function InstructionCard({ title, items, tone, icon }: { title: string; items: string[]; tone: "green" | "blue" | "amber"; icon: React.ReactNode }) {
  const classes = {
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-electric-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700"
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <span className={cn("grid h-8 w-8 place-items-center rounded-full", classes[tone])}>{icon}</span>
          <h3 className="font-bold">{title}</h3>
        </div>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-800">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className={cn("mt-5 rounded-lg border px-4 py-3 text-xs font-medium", classes[tone])}>
          {tone === "green" && "Tip: Think light, buzzy, and relaxed."}
          {tone === "blue" && "You're building control and consistency."}
          {tone === "amber" && "Stay light, relaxed, and consistent."}
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionOverview({ currentIndex, completedMinutes }: { currentIndex: number; completedMinutes: number }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-7">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-electric-600" />
            <h3 className="text-xl font-bold">Session Overview</h3>
          </div>
          <p className="mt-8 text-slate-600">Total Length</p>
          <p className="mt-4 text-4xl font-black">33 <span className="text-xl">min</span></p>
          <Progress value={(completedMinutes / 33) * 100} className="mt-8 h-4" indicatorClassName="bg-emerald-400" />
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>{completedMinutes} min completed</span>
            <span>33 min total</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-7">
          <h3 className="text-xl font-bold">Up Next</h3>
          <p className="mt-1 text-sm text-slate-500">{Math.max(0, 4 - currentIndex)} steps remaining</p>
          <div className="mt-6 space-y-6">
            {todayExercises.slice(currentIndex + 1).map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-300 font-bold text-white">{item.order}</span>
                <span className="flex-1 font-semibold">{item.title}</span>
                <span className="text-slate-500">{item.durationMinutes} min</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="mini-wave bg-blue-50">
        <CardContent className="p-7">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-100 font-bold">VC</div>
            <h3 className="text-xl font-bold text-electric-700">Coach Tip</h3>
          </div>
          <p className="mt-6 leading-7 text-slate-700">Smooth is fast. Focus on control first—range will follow.</p>
          <p className="mt-6 font-semibold text-electric-700">– Your Voice Coach</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function SessionClient() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([0]);
  const [completedMinutes, setCompletedMinutes] = useState(12);
  const [isComplete, setIsComplete] = useState(false);
  const exercise = todayExercises[currentIndex] ?? todayExercises[1];

  const finishSession = (note?: string, finalMinutes = completedMinutes) => {
    if (isComplete) return;
    setIsComplete(true);
    const minutes = Math.min(33, Math.max(finalMinutes, completedSteps.reduce((sum, index) => sum + (todayExercises[index]?.durationMinutes ?? 0), 0)));
    completeSession(minutes, todayExercises.map((item) => item.title), note || "Completed today's guided Voice Flex session.");
    router.push("/progress");
  };

  const next = () => {
    setCompletedSteps((steps) => Array.from(new Set([...steps, currentIndex])));
    const nextMinutes = Math.min(33, Math.max(completedMinutes, todayExercises.slice(0, currentIndex + 1).reduce((sum, item) => sum + item.durationMinutes, 0)));
    setCompletedMinutes(nextMinutes);
    if (currentIndex >= todayExercises.length - 1) {
      finishSession("Finished all guided exercises.", 33);
      return;
    }
    setCurrentIndex((value) => Math.min(todayExercises.length - 1, value + 1));
  };
  const previous = () => setCurrentIndex((value) => Math.max(0, value - 1));
  const earnMinute = () => setCompletedMinutes((minutes) => Math.min(33, minutes + 1));

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[340px_1fr_395px]">
        <SessionTimeline currentIndex={currentIndex} completedSteps={completedSteps} />
        <div className="space-y-5">
          <ExerciseTimer currentIndex={currentIndex} onNext={next} onPrevious={previous} onMinuteEarned={earnMinute} />
          <div className="grid gap-4 md:grid-cols-3">
            <InstructionCard title="What to do now" items={exercise.instructions} tone="green" icon={<Check className="h-5 w-5" />} />
            <InstructionCard title="How it should feel" items={exercise.howItShouldFeel} tone="blue" icon={<Check className="h-5 w-5 fill-current" />} />
            <InstructionCard title="Common mistakes" items={exercise.commonMistakes} tone="amber" icon={<AlertTriangle className="h-5 w-5" />} />
          </div>
        </div>
        <SessionOverview currentIndex={currentIndex} completedMinutes={completedMinutes} />
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:flex-row md:items-center">
        <p className="flex-1 px-4 text-slate-600">Consistency today, confidence tomorrow.</p>
        <p className="text-slate-600">Need a break? You can pause and come back anytime.</p>
        <Button onClick={() => finishSession("Ended session early and saved progress.")} variant="danger">End Session</Button>
      </div>
    </>
  );
}
