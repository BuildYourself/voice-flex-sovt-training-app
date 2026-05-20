"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, Expand, Pause, Play, Shield, SkipBack, SkipForward, Star, Target, Waves, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { voiceFlexProSession } from "@/lib/session-data";
import { saveVoiceFlexProSession } from "@/lib/session-localstorage";
import { cn } from "@/lib/utils";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function ProSessionScreen() {
  const router = useRouter();
  const steps = voiceFlexProSession.steps;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0].durationSeconds);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const current = steps[currentIndex];
  const stepProgress = ((current.durationSeconds - remaining) / current.durationSeconds) * 100;

  const completeCurrentStep = useCallback(() => {
    setCompleted((items) => Array.from(new Set([...items, currentIndex])));
    if (currentIndex >= steps.length - 1) {
      saveVoiceFlexProSession(7);
      router.push("/progress");
      return;
    }
    setCurrentIndex((index) => index + 1);
  }, [currentIndex, router, steps.length]);

  useEffect(() => {
    setRemaining(steps[currentIndex].durationSeconds);
    setRunning(false);
  }, [currentIndex, steps]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed((value) => Math.min(voiceFlexProSession.totalSeconds, value + 1));
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          completeCurrentStep();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [completeCurrentStep, running]);

  const previous = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const skip = () => {
    setElapsed((value) => Math.min(voiceFlexProSession.totalSeconds, value + remaining));
    completeCurrentStep();
  };

  const overviewProgress = Math.min(100, (elapsed / voiceFlexProSession.totalSeconds) * 100);
  const upcoming = steps.slice(currentIndex + 1);

  return (
    <div className="space-y-5">
      <CompactSessionStepper currentIndex={currentIndex} completed={completed} />
      <div className="grid gap-6 2xl:grid-cols-[330px_minmax(0,1fr)_390px]">
        <SessionFlow currentIndex={currentIndex} completed={completed} />

        <div className="order-1 space-y-5 2xl:order-2">
          <Card className="overflow-hidden">
            <CardContent className="p-5 sm:p-7 xl:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 text-slate-700">
                  <Waves className="h-7 w-7 text-electric-600 sm:h-8 sm:w-8" />
                  <span className="text-base font-medium sm:text-lg">Current Exercise</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-electric-700 sm:px-4 sm:text-base">Step {currentIndex + 1} of 7</span>
                  <Expand className="hidden h-6 w-6 text-slate-500 sm:block" />
                </div>
              </div>

              <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-black sm:text-5xl">{current.title}</h2>
                  <p className="mt-5 flex items-center gap-3 text-base text-slate-700 sm:text-lg">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span>Tool: {current.tool}</span>
                  </p>
                  <p className="mt-5 max-w-[640px] text-base leading-7 text-slate-800 sm:text-lg sm:leading-8">{current.instruction}</p>

                  <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <MiniListCard title="How it should feel" items={current.howItShouldFeel} tone="blue" />
                    <MiniListCard title="Common mistakes" items={current.commonMistakes} tone="red" />
                  </div>
                </div>

                <div className="grid place-items-center">
                  <div className="relative grid h-[238px] w-[238px] place-items-center rounded-full sm:h-[282px] sm:w-[282px]">
                    <div className="absolute inset-0 rounded-full border-[18px] border-blue-100" />
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#176bff ${stepProgress * 3.6}deg, transparent 0deg)`,
                        WebkitMask: "radial-gradient(circle, transparent 58%, #000 59%)",
                        mask: "radial-gradient(circle, transparent 58%, #000 59%)"
                      }}
                    />
                    <div className="relative text-center">
                      <p className="text-5xl font-black text-black sm:text-6xl">{formatClock(remaining)}</p>
                      <p className="mt-3 text-slate-600">Remaining</p>
                    </div>
                    <span className="absolute bottom-[18px] right-[64px] h-6 w-6 rounded-full bg-white shadow-md ring-4 ring-blue-500" />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-24 z-20 mx-auto mt-9 grid max-w-[760px] grid-cols-3 items-center rounded-full border border-blue-100 bg-white p-2 shadow-soft sm:static">
                <button onClick={previous} className="flex items-center justify-center gap-3 rounded-full py-5 font-bold text-slate-800 hover:bg-slate-50">
                  <SkipBack className="h-5 w-5" /> <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  onClick={() => setRunning((value) => !value)}
                  className="mx-auto -my-7 grid h-20 w-20 place-items-center rounded-full border-[7px] border-white bg-electric-600 text-white shadow-xl shadow-blue-300 sm:-my-8 sm:h-24 sm:w-24 sm:border-[8px]"
                  aria-label={running ? "Pause" : "Start Exercise"}
                >
                  {running ? <Pause className="h-8 w-8 fill-current sm:h-10 sm:w-10" /> : <Play className="h-8 w-8 fill-current sm:h-10 sm:w-10" />}
                </button>
                <button onClick={skip} className="flex items-center justify-center gap-3 rounded-full py-5 font-bold text-slate-800 hover:bg-slate-50">
                  <span className="hidden sm:inline">Skip Step</span><span className="sm:hidden">Skip</span> <SkipForward className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-5 text-center text-sm text-slate-600">{running ? "Pause" : "Start Exercise"}</p>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-3">
            <GuidanceCard icon={<Target className="h-8 w-8" />} title="What to do now" text="Follow the instructions above. Keep the bubbles small and steady. Stay relaxed." tone="green" />
            <GuidanceCard icon={<CheckCircle2 className="h-8 w-8" />} title="How it should feel" text="You should feel light resistance and steady bubbling. No strain, no throat pressure." tone="blue" />
            <GuidanceCard icon={<AlertTriangle className="h-8 w-8" />} title="Common mistakes" text="Blowing too hard or making large bubbles. Keep it soft and easy." tone="red" />
          </div>
        </div>

        <div className="order-3 space-y-5 2xl:order-3">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <span className="grid h-8 w-8 place-items-center rounded-full text-electric-700"><Waves className="h-8 w-8" /></span>
                <h3 className="text-2xl font-black">Session Overview</h3>
              </div>
              <p className="mt-9 text-slate-600">Total Length</p>
              <p className="mt-3 text-4xl font-black">10:30 <span className="text-xl">min</span></p>
              <Progress value={overviewProgress} className="mt-8 h-4" indicatorClassName="bg-emerald-400" />
              <div className="mt-4 flex justify-between text-sm text-slate-500">
                <span>{formatElapsed(elapsed)} completed</span>
                <span>{voiceFlexProSession.totalDisplay} total</span>
              </div>
              <div className="mt-10 grid grid-cols-2 divide-x divide-slate-200 text-center">
                <div>
                  <p className="flex items-center justify-center gap-2 text-2xl font-black"><CheckCircle2 className="h-7 w-7 text-electric-600" />{completed.length}</p>
                  <p className="mt-2 text-slate-600">Steps Completed</p>
                </div>
                <div>
                  <p className="flex items-center justify-center gap-2 text-2xl font-black"><Star className="h-7 w-7 text-amber-400" />{completed.length >= 7 ? 1 : 0}</p>
                  <p className="mt-2 text-slate-600">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-0 2xl:min-h-[530px]">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-2xl font-black">Up Next</h3>
              <p className="mt-1 text-slate-500">{upcoming.length} steps remaining</p>
              <div className="mt-7 space-y-7">
                {upcoming.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 font-bold text-slate-500">{currentIndex + index + 2}</span>
                    <span className="flex-1 font-black">{step.title}</span>
                    <span className="text-slate-500">{step.displayDuration}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-slate-800 sm:px-6">
        <Shield className="mr-3 inline h-6 w-6 text-amber-500" />
        <b>Safety Note:</b> If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.
      </div>
    </div>
  );
}

function SessionFlow({ currentIndex, completed }: { currentIndex: number; completed: number[] }) {
  return (
    <Card className="order-2 hidden min-h-[820px] 2xl:order-1 2xl:block">
      <CardHeader>
        <CardTitle className="text-2xl">Session Flow</CardTitle>
        <span className="text-slate-600">7 Steps</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {voiceFlexProSession.steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = completed.includes(index);
          return (
            <div key={step.id} className={cn("relative grid grid-cols-[46px_1fr] gap-3 rounded-2xl p-3", isCurrent && "border border-electric-600 bg-blue-50")}>
              {index < voiceFlexProSession.steps.length - 1 && <span className="absolute left-[39px] top-14 h-14 border-l-2 border-dashed border-slate-300" />}
              <span className={cn("relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-300 text-lg font-bold text-white", isCurrent && "bg-electric-600", isCompleted && "bg-emerald-500")}>
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </span>
              <div>
                <p className={cn("text-base font-black", isCurrent && "text-electric-700")}>{step.title}</p>
                <p className={cn("mt-1 text-sm text-slate-600", isCurrent && "font-bold text-electric-700")}>{step.displayDuration}{isCurrent ? " - Current" : ""}</p>
              </div>
            </div>
          );
        })}
        <Button variant="outline" className="mt-9 w-full justify-between">View full plan <SkipForward className="h-4 w-4" /></Button>
      </CardContent>
    </Card>
  );
}

function CompactSessionStepper({ currentIndex, completed }: { currentIndex: number; completed: number[] }) {
  return (
    <Card className="2xl:hidden">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-black">Session Flow</p>
          <p className="text-sm text-slate-500">Step {currentIndex + 1} of 7</p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {voiceFlexProSession.steps.map((step, index) => {
            const active = index === currentIndex;
            const done = completed.includes(index);
            return (
              <div key={step.id} className="min-w-0 text-center">
                <div className={cn("mx-auto grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-500", active && "bg-electric-600 text-white", done && "bg-emerald-500 text-white")}>
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <p className={cn("mt-1 truncate text-[10px] font-bold text-slate-500", active && "text-electric-700")}>{step.title}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniListCard({ title, items, tone }: { title: string; items: string[]; tone: "blue" | "red" }) {
  return (
    <div className={cn("rounded-xl border p-5", tone === "blue" ? "border-blue-100 bg-blue-50" : "border-red-100 bg-red-50")}>
      <h3 className={cn("font-black", tone === "blue" ? "text-electric-700" : "text-red-600")}>{title}</h3>
      <ul className="mt-5 space-y-4 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            {tone === "blue" ? <Check className="h-5 w-5 text-electric-600" /> : <X className="h-5 w-5 text-red-500" />}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuidanceCard({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: "green" | "blue" | "red" }) {
  const styles = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-600",
    blue: "border-blue-100 bg-blue-50 text-electric-600",
    red: "border-red-100 bg-red-50 text-red-600"
  };
  return (
    <Card className={cn("border", styles[tone])}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {icon}
          <h3 className="text-lg font-black text-slate-950">{title}</h3>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{text}</p>
      </CardContent>
    </Card>
  );
}
