import { AppShell } from "@/components/app-shell";
import { CoachTipCard, HeroCard, ProgramsStrip, RecentWins, Roadmap, StatsGrid, TodayPlan } from "@/components/dashboard-components";

export default function DashboardPage() {
  return (
    <AppShell title="Good morning, Alex 👋" subtitle="Consistency today, confidence tomorrow.">
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <HeroCard />
        <StatsGrid />
      </div>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[390px_minmax(0,1fr)_410px]">
        <TodayPlan />
        <div className="space-y-5">
          <Roadmap />
          <ProgramsStrip />
        </div>
        <div className="space-y-5">
          <CoachTipCard />
          <RecentWins />
        </div>
      </div>
    </AppShell>
  );
}
