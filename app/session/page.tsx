import { Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SessionClient } from "@/components/session-components";
import { Button } from "@/components/ui/button";

export default function SessionPage() {
  return (
    <AppShell
      title="Today’s Guided Session"
      subtitle="Just follow the sequence. We’ll guide you step by step."
      pill={<div className="rounded-full border border-blue-200 bg-blue-50 px-6 py-2 font-semibold text-electric-700"><Clock className="mr-2 inline h-4 w-4" />From Point A to Point B — one guided step at a time.</div>}
    >
      <SessionClient />
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:flex-row md:items-center">
        <p className="flex-1 px-4 text-slate-600">Consistency today, confidence tomorrow.</p>
        <p className="text-slate-600">Need a break? You can pause and come back anytime.</p>
        <Button variant="danger">End Session</Button>
      </div>
    </AppShell>
  );
}
