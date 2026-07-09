"use client";

import { SettingsContent } from "@/components/settings-content";
import { TrainingSidebar } from "@/components/training-sidebar";
import type { VoiceFlexProduct } from "@/lib/training-product";

export function TrainingSettings({ productType }: { productType: VoiceFlexProduct }) {
  return (
    <main className="min-h-screen bg-[#f4f8fd] text-navy-950 lg:pl-[272px]">
      <TrainingSidebar productType={productType} activeItem="settings" />
      <div className="mx-auto max-w-[1460px] px-5 py-8 md:px-8 lg:px-9">
        <header className="mb-9">
          <h1 className="text-4xl font-black tracking-tight text-black">Settings</h1>
          <p className="mt-3 text-lg text-slate-600">Manage your preferences and app settings.</p>
        </header>

        <SettingsContent />
      </div>
    </main>
  );
}
