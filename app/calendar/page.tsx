"use client";

import { AppShell } from "@/components/app-shell";
import { ProgressCalendar } from "@/components/progress-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <AppShell title="Training Calendar" subtitle="See your completed sessions, planned practice, rest days, and milestones.">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <ProgressCalendar interactive />
        <Card>
          <CardHeader><CardTitle>Completion System</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <p><b className="text-emerald-600">Completed</b> days count toward your streak and total minutes.</p>
            <p><b className="text-electric-700">Today</b> is your next guided step in the 21-Day Transformation Program.</p>
            <p><b>Milestones</b> unlock new modules and help you see the path from Point A to Point B.</p>
            <div className="rounded-2xl bg-blue-50 p-5 font-semibold text-navy-800">From Point A to Point B — one guided step at a time.</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
