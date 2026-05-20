"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings, resetDemoData, setSettings, type VoiceFlexSettings } from "@/lib/storage";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setLocalSettings] = useState<VoiceFlexSettings>({
    displayName: "Alex Morgan",
    preferredGoal: "Singing",
    reminders: true,
    dailyTrainingTime: "08:00"
  });

  useEffect(() => {
    setLocalSettings(getSettings());
  }, []);

  const save = () => {
    setSettings(settings);
    router.refresh();
  };

  const reset = () => {
    resetDemoData();
    router.push("/dashboard");
  };

  return (
    <AppShell title="Settings" subtitle="Tune Voice Flex around your training rhythm.">
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Profile & Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <label className="block">
            <span className="font-bold">Display name</span>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-electric-500"
              value={settings.displayName}
              onChange={(event) => setLocalSettings((value) => ({ ...value, displayName: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="font-bold">Preferred goal</span>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-electric-500"
              value={settings.preferredGoal}
              onChange={(event) => setLocalSettings((value) => ({ ...value, preferredGoal: event.target.value as VoiceFlexSettings["preferredGoal"] }))}
            >
              <option>Singing</option>
              <option>Speaking</option>
              <option>Recovery</option>
              <option>Range</option>
            </select>
          </label>
          <label className="block">
            <span className="font-bold">Daily training time</span>
            <input
              type="time"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-electric-500"
              value={settings.dailyTrainingTime}
              onChange={(event) => setLocalSettings((value) => ({ ...value, dailyTrainingTime: event.target.value }))}
            />
          </label>
          <button onClick={() => setLocalSettings((value) => ({ ...value, reminders: !value.reminders }))} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
            <span className="font-bold">Reminders</span>
            <span className={`h-7 w-12 rounded-full p-1 transition ${settings.reminders ? "bg-electric-600" : "bg-slate-300"}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${settings.reminders ? "translate-x-5" : ""}`} /></span>
          </button>
          <div className="flex flex-wrap gap-3">
            <Button onClick={save}><Save className="h-4 w-4" />Save Settings</Button>
            <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4" />Reset Demo Data</Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
