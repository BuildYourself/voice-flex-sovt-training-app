import { AppShell } from "@/components/app-shell";
import { CoachTipCard, HeroCard, ProgramsStrip, RecentWins, Roadmap, StatsGrid, TodayPlan } from "@/components/dashboard-components";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";
import { getCurrentPlanForUser } from "@/lib/user-progress-db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { progress, program, day, exercises } = await getCurrentPlanForUser();
  const isFirstLoginSetup = Number(progress.total_minutes || 0) === 0 && (progress.sessions_completed || 0) === 0;
  const nextMilestoneDay = Math.min((progress.current_day || 1) + 2, program?.duration_days || 21);
  const nextMilestoneLabel = `Continue ${program?.title ?? "training"} progression`;

  if (isFirstLoginSetup) {
    return (
      <AppShell
        title="Let's set up your Voice Flex GO"
        subtitle="We'll walk you through everything you need to know so you can use Voice Flex correctly and confidently before starting Day 1."
        topStats={{ dayStreak: progress.day_streak || 0, totalMinutes: Number(progress.total_minutes || 0) }}
      >
        <DashboardOnboarding />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Good morning, Alex 👋"
      subtitle="Consistency today, confidence tomorrow."
      topStats={{ dayStreak: progress.day_streak || 0, totalMinutes: Number(progress.total_minutes || 0) }}
    >
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <HeroCard currentDay={progress.current_day || 1} durationDays={program?.duration_days || 21} />
        <StatsGrid
          dayStreak={progress.day_streak || 0}
          totalMinutes={Number(progress.total_minutes || 0)}
          sessionsCompleted={progress.sessions_completed || 0}
          nextMilestoneDay={nextMilestoneDay}
          nextMilestoneLabel={nextMilestoneLabel}
        />
      </div>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[390px_minmax(0,1fr)_410px]">
        <TodayPlan initialExercises={exercises} initialEstimatedMinutes={day?.estimated_minutes ?? null} />
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
