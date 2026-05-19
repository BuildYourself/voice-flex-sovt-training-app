import { Mic, Waves } from "lucide-react";

export function SingerVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "relative h-full min-h-[160px] overflow-hidden rounded-xl bg-[#022b58]" : "absolute inset-y-0 right-0 hidden w-[44%] overflow-hidden rounded-r-2xl md:block"}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_24%,rgba(255,255,255,.28),transparent_13%),linear-gradient(90deg,rgba(0,38,84,0)_0%,rgba(0,21,51,.2)_35%,rgba(0,10,28,.78)_100%)]" />
      <div className="hero-person absolute inset-0 opacity-95" />
      <div className="absolute bottom-0 right-[8%] h-[78%] w-[44%] rounded-t-full bg-gradient-to-b from-slate-200/70 via-slate-700 to-slate-950 shadow-2xl" />
      <div className="absolute right-[28%] top-[14%] h-20 w-20 rounded-full bg-gradient-to-br from-rose-100 via-rose-200 to-amber-200 shadow-lg" />
      <div className="absolute right-[25%] top-[10%] h-24 w-16 rounded-full border-[10px] border-slate-950 bg-slate-800" />
      <div className="absolute right-[58%] top-[30%] h-[46%] w-10 rounded-full bg-gradient-to-b from-slate-200 to-slate-900 shadow-xl" />
      <div className="absolute right-[55%] top-[46%] h-2 w-36 bg-slate-800/90" />
      <div className="absolute left-10 top-10 flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur">
        <Mic className="h-4 w-4 text-cyan-200" />
        <Waves className="h-6 w-6 text-cyan-200" />
      </div>
    </div>
  );
}

export function Waveform({ className = "" }: { className?: string }) {
  const bars = [8, 13, 9, 24, 36, 22, 30, 17, 9, 13, 28, 36, 16, 22, 31, 14, 24, 11, 35, 28, 17, 20, 33, 14, 25, 18, 29, 12, 17, 23, 31, 10, 15, 20, 24];
  return (
    <div className={`flex h-14 items-center gap-1 ${className}`}>
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-300 to-electric-500"
          style={{ height, opacity: 0.45 + (index % 5) * 0.1 }}
        />
      ))}
    </div>
  );
}
