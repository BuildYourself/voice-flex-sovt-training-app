"use client";

import { useEffect, useState } from "react";
import { Bell, Timer } from "lucide-react";
import { defaultProgress, getProgress, type VoiceFlexProgress } from "@/lib/storage";

export function TopStats() {
  const [progress, setProgress] = useState<VoiceFlexProgress>(defaultProgress);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="flex items-center gap-3 text-slate-700 md:gap-6">
      <div className="flex items-center gap-1.5 md:gap-2">
        <span className="text-lg md:text-2xl">🔥</span>
        <div className="leading-tight">
          <p className="text-base font-black text-black md:text-xl">{progress.dayStreak}</p>
          <p className="hidden text-sm sm:block">day streak</p>
        </div>
      </div>
      <div className="h-8 w-px bg-slate-200 md:h-10" />
      <div className="flex items-center gap-1.5 md:gap-2">
        <Timer className="h-5 w-5 text-electric-600 md:h-6 md:w-6" />
        <div className="leading-tight">
          <p className="text-base font-black text-black md:text-xl">{progress.totalMinutes}</p>
          <p className="hidden text-sm sm:block">total minutes</p>
        </div>
      </div>
      <div className="hidden h-10 w-px bg-slate-200 md:block" />
      <button className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 md:h-11 md:w-11" aria-label="Notifications">
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-electric-600 ring-2 ring-white md:h-3 md:w-3" />
      </button>
    </div>
  );
}
