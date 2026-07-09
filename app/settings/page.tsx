"use client";

import { AppShell } from "@/components/app-shell";
import { SettingsContent } from "@/components/settings-content";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Manage your preferences and app settings." showTopStats={false}>
      <SettingsContent />
    </AppShell>
  );
}
