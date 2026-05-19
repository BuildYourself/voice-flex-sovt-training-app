"use client";

import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [reminders, setReminders] = useState(true);
  return (
    <AppShell title="Settings" subtitle="Tune Voice Flex around your training rhythm.">
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Profile & Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <label className="block">
            <span className="font-bold">Display name</span>
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-electric-500" defaultValue="Alex Morgan" />
          </label>
          <label className="block">
            <span className="font-bold">Preferred goal</span>
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-electric-500" defaultValue="Singing">
              <option>Singing</option>
              <option>Speaking</option>
              <option>Recovery</option>
              <option>Range</option>
            </select>
          </label>
          <label className="block">
            <span className="font-bold">Daily training time</span>
            <input type="time" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-electric-500" defaultValue="08:00" />
          </label>
          <button onClick={() => setReminders((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
            <span className="font-bold">Reminders</span>
            <span className={`h-7 w-12 rounded-full p-1 transition ${reminders ? "bg-electric-600" : "bg-slate-300"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${reminders ? "translate-x-5" : ""}`} /></span>
          </button>
          <div className="flex flex-wrap gap-3">
            <Button><Save className="h-4 w-4" />Save Settings</Button>
            <Button variant="outline"><LogOut className="h-4 w-4" />Logout</Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
