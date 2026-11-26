"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Square, Timer, Trophy, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getBestHold, saveBestHold, type GuidePattern, type VoiceRange } from "@/lib/guide-tones";
import { cn } from "@/lib/utils";

const PATTERN_HINT: Record<Exclude<GuidePattern, "hold-note">, string> = {
  "steady-notes": "A guide note plays for 5 seconds. Match it and hold it steady, then follow it to the next one.",
  "slide-151": "Five quick notes play. Slide them through the tool in the gap, then the next round starts one note higher.",
  swell: "One note plays for 6 seconds. Swell on it: soft, a little louder, soft again.",
};

export function VoiceRangeToggle({
  range,
  onChange,
  compact = false
}: {
  range: VoiceRange | null;
  onChange: (range: VoiceRange) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", compact && "text-sm")}>
      <span className={cn("font-black text-navy-950", !range && "text-electric-700")}>{range ? "Guide tones for:" : "Pick your voice for the guide tones:"}</span>
      <div className="inline-flex rounded-xl border border-blue-200 bg-white p-1" role="group" aria-label="Voice range for guide tones">
        {(["lower", "higher"] as VoiceRange[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={range === option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-black transition",
              range === option ? "bg-electric-600 text-white" : "text-slate-600 hover:text-electric-700"
            )}
          >
            {option === "lower" ? "Lower voice" : "Higher voice"}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Extra tools for exercises that use browser-made guide tones:
 * a voice range choice, a test note, and for Long Hum Hold a hold timer.
 */
export function ExerciseGuidePanel({
  productType,
  pattern,
  range,
  onRangeChange,
  onPlayNote,
  practicing
}: {
  productType: string;
  pattern: GuidePattern;
  range: VoiceRange | null;
  onRangeChange: (range: VoiceRange) => void;
  onPlayNote: () => void;
  practicing: boolean;
}) {
  return (
    <div className="mt-4 rounded-3xl border border-violet-200 bg-violet-50/40 p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
          <Music2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm leading-6 text-slate-700">
            {pattern === "hold-note"
              ? "Tap Your note to hear a comfortable starting note, then hold it as long as it stays easy."
              : `${PATTERN_HINT[pattern]} The tones start with the timer.`}
          </p>
          <VoiceRangeToggle range={range} onChange={onRangeChange} />
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-violet-200 bg-white font-black text-violet-700"
            onClick={onPlayNote}
            disabled={practicing && pattern !== "hold-note"}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {pattern === "hold-note" ? "Your note" : "Test note"}
          </Button>
        </div>
      </div>
      {pattern === "hold-note" ? <HoldTimer productType={productType} /> : null}
    </div>
  );
}

function HoldTimer({ productType }: { productType: string }) {
  const [holding, setHolding] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [holds, setHolds] = useState<number[]>([]);
  const [bestEver, setBestEver] = useState(0);
  const startedAt = useRef<number | null>(null);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    setBestEver(getBestHold(productType));
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [productType]);

  function start() {
    startedAt.current = performance.now();
    setSeconds(0);
    setHolding(true);
    tick.current = window.setInterval(() => {
      if (startedAt.current !== null) setSeconds((performance.now() - startedAt.current) / 1000);
    }, 100);
  }

  function stop() {
    if (tick.current) window.clearInterval(tick.current);
    tick.current = null;
    const held = startedAt.current !== null ? (performance.now() - startedAt.current) / 1000 : 0;
    startedAt.current = null;
    setHolding(false);
    setSeconds(held);
    if (held >= 1) {
      setHolds((current) => [...current, held]);
      saveBestHold(productType, held);
      setBestEver(getBestHold(productType));
    }
  }

  const bestToday = holds.length ? Math.max(...holds) : 0;

  return (
    <div className="mt-4 grid gap-3 rounded-2xl border border-violet-100 bg-white p-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <Button
        type="button"
        className={cn("h-14 min-w-[170px] rounded-2xl text-base font-black", holding && "bg-violet-600 hover:bg-violet-700")}
        onClick={holding ? stop : start}
      >
        {holding ? <Square className="mr-2 h-4 w-4 fill-current" /> : <Timer className="mr-2 h-5 w-5" />}
        {holding ? "Stop" : "Start hold"}
      </Button>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
        <span>
          <span className="block text-3xl font-black tabular-nums text-black">{seconds.toFixed(1)}s</span>
          {holding ? "holding" : holds.length ? `hold ${holds.length}` : "ready"}
        </span>
        <span>
          <span className="block text-lg font-black tabular-nums text-black">{bestToday ? `${bestToday.toFixed(1)}s` : "-"}</span>
          best this session
        </span>
        <span className="inline-flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>
            <span className="block text-lg font-black tabular-nums text-black">{bestEver ? `${bestEver.toFixed(1)}s` : "-"}</span>
            your best
          </span>
        </span>
      </div>
    </div>
  );
}
