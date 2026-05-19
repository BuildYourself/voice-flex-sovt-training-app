import { AppShell } from "@/components/app-shell";
import { CoachTipCard, HeroCard, ProgramsStrip, RecentWins, Roadmap, StatsGrid, TodayPlan } from "@/components/dashboard-components";

export default function DashboardPage() {
  return (
    <AppShell title="Good morning, Alex 👋" subtitle="Consistency today, confidence tomorrow.">
      <div className="grid gap-5 xl:grid-cols-[1fr_448px]">
        <HeroCard />
        <StatsGrid />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[420px_1fr_448px]">
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
