import { CheckCircle2, Clock, Flame, TrendingUp } from "lucide-react";
import type React from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentPlanForUser, getUserSessions } from "@/lib/user-progress-db";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const { progress, program } = await getCurrentPlanForUser();
  const sessions = await getUserSessions(8);
  const durationDays = program?.duration_days || 21;
  const currentDay = Math.max(1, progress.current_day || 1);
  const percent = Math.max(1, Math.min(100, Math.round((currentDay / durationDays) * 100)));

  return (
    <AppShell
      title="Progress & Streaks"
      subtitle="Track the small wins that build a better voice."
      topStats={{ dayStreak: progress.day_streak || 0, totalMinutes: Number(progress.total_minutes || 0) }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Flame className="h-6 w-6 text-orange-500" />} label="Your Streak" value={`${progress.day_streak || 0}`} sub="day streak" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6 text-purple-600" />} label="Sessions Completed" value={`${progress.sessions_completed || 0}`} sub="sessions" />
        <StatCard icon={<Clock className="h-6 w-6 text-electric-600" />} label="Total Minutes" value={`${Number(progress.total_minutes || 0)}`} sub="minutes" />
        <StatCard icon={<TrendingUp className="h-6 w-6 text-emerald-600" />} label="Program Progress" value={`Day ${currentDay}`} sub={`of ${durationDays}`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{program?.title || "Current Program"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{percent}% complete</span>
              <span>
                Day {currentDay} / {durationDays}
              </span>
            </div>
            <Progress value={percent} className="mt-3 h-3" indicatorClassName="bg-emerald-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Completed Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-600">Complete your first Voice Flex session to start tracking progress.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-xl border border-slate-200 px-4 py-3">
                    <p className="font-semibold">{session.session_name || "Guided Session"}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {Number(session.total_minutes || 0)} min • {session.steps_completed || 0} steps • {new Date(session.completed_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">{icon}</span>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
        </div>
        <p className="mt-4 text-3xl font-black">{value}</p>
        <p className="text-sm text-slate-500">{sub}</p>
      </CardContent>
    </Card>
  );
}
