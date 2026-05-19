import { AppShell } from "@/components/app-shell";
import { AchievementList, JournalCard, ProgressCalendar, ProgressStatCards, ProgramProgressRoadmap, RecentImprovements, RecommendedSession } from "@/components/progress-components";

export default function ProgressPage() {
  return (
    <AppShell title="Progress & Streaks" subtitle="Track the small wins that build a better voice.">
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_2.4fr]">
        <ProgressStatCards />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[560px_1fr_420px]">
        <ProgressCalendar />
        <ProgramProgressRoadmap />
        <JournalCard />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr_1fr]">
        <RecentImprovements />
        <AchievementList />
        <RecommendedSession />
      </div>
      <div className="mt-5 rounded-2xl bg-blue-50 px-8 py-4 text-slate-600"><span className="font-bold text-electric-700">Daily Tip</span> &nbsp; Small steps, big change. Keep showing up for your voice.</div>
    </AppShell>
  );
}
