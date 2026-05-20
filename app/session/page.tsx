import { Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProSessionScreen } from "@/components/session/pro-session-screen";
import { getTodayPlan } from "@/lib/programs-db";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const todayPlan = await getTodayPlan();

  return (
    <AppShell
      title="Today’s Guided Session"
      subtitle="Just follow the sequence. We’ll guide you step by step."
      pill={
        <div className="rounded-full border border-blue-200 bg-blue-50 px-6 py-2 font-semibold text-electric-700">
          <Clock className="mr-2 inline h-4 w-4" />
          From Point A to Point B — one guided step at a time.
        </div>
      }
    >
      <ProSessionScreen initialExercises={todayPlan.exercises} />
    </AppShell>
  );
}
