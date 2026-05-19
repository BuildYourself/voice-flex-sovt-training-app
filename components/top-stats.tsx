import { Bell, Timer } from "lucide-react";

export function TopStats() {
  return (
    <div className="flex items-center gap-6 text-slate-700">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <div className="leading-tight">
          <p className="text-xl font-black text-black">12</p>
          <p className="text-sm">day streak</p>
        </div>
      </div>
      <div className="h-10 w-px bg-slate-200" />
      <div className="flex items-center gap-2">
        <Timer className="h-6 w-6 text-electric-600" />
        <div className="leading-tight">
          <p className="text-xl font-black text-black">245</p>
          <p className="text-sm">total minutes</p>
        </div>
      </div>
      <div className="h-10 w-px bg-slate-200" />
      <button className="relative grid h-11 w-11 place-items-center rounded-xl hover:bg-slate-100" aria-label="Notifications">
        <Bell className="h-6 w-6" />
        <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-electric-600 ring-2 ring-white" />
      </button>
    </div>
  );
}
