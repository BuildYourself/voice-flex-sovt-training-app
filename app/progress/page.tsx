import { AppShell } from "@/components/app-shell";
import { AchievementList, JournalCard, ProgressCalendar, ProgressStatCards, ProgramProgressRoadmap, RecentImprovements, RecommendedSession } from "@/components/progress-components";

export default function ProgressPage() {
  return (
    <AppShell title="Progress & Streaks" subtitle="Track the small wins that build a better voice.">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-[1fr_1fr_1fr_2.4fr]">
        <ProgressStatCards />
      </div>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[520px_minmax(0,1fr)_390px]">
        <ProgressCalendar />
        <ProgramProgressRoadmap />
        <JournalCard />
      </div>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.4fr_1fr_1fr]">
        <RecentImprovements />
        <AchievementList />
        <RecommendedSession />
      </div>
      <div className="mt-6 rounded-2xl bg-blue-50 px-5 py-4 text-slate-600 sm:px-8"><span className="font-bold text-electric-700">Daily Tip</span> &nbsp; Small steps, big change. Keep showing up for your voice.</div>
    </AppShell>
  );
}
