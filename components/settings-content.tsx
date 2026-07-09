"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Info,
  LogOut,
  SlidersHorizontal,
  User
} from "lucide-react";
import { resetAllLocalMilestones } from "@/lib/local-milestones";
import { trainingProgressStore } from "@/lib/training-progress";
import type { VoiceFlexProduct } from "@/lib/training-product";

type ProductType = VoiceFlexProduct;

type LocalSettings = {
  displayName: string;
};

const SETTINGS_KEY = "voiceflex_settings";

const defaultSettings: LocalSettings = {
  displayName: "Voice Flex User"
};

function safeReadSettings(): LocalSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<LocalSettings>;

    return {
      displayName:
        typeof parsed.displayName === "string" && parsed.displayName.trim()
          ? parsed.displayName
          : defaultSettings.displayName
    };
  } catch (error) {
    console.warn("[settings] Could not read local settings", error);
    return defaultSettings;
  }
}

function saveLocalSettings(settings: LocalSettings) {
  const existingRaw = window.localStorage.getItem(SETTINGS_KEY);
  let existing: Record<string, unknown> = {};

  try {
    existing = existingRaw ? (JSON.parse(existingRaw) as Record<string, unknown>) : {};
  } catch {
    existing = {};
  }

  window.localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      ...existing,
      displayName: settings.displayName
    })
  );
}

function getLocalProduct(): ProductType {
  if (typeof window === "undefined") return "go";
  const stored = window.localStorage.getItem("voiceflex_active_product");
  return stored === "pro" ? "pro" : "go";
}

function getRouteProduct(pathname: string | null): ProductType | null {
  if (!pathname?.startsWith("/train/")) return null;
  return pathname.split("/")[2] === "pro" ? "pro" : "go";
}

function getLocalOrderAccessId() {
  if (typeof window === "undefined") return "Order Access ID unavailable";

  return (
    window.localStorage.getItem("voiceflex_verified_order_number") ||
    window.localStorage.getItem("voiceflex_order_number") ||
    window.localStorage.getItem("voiceflex_order_access_id") ||
    "Order Access ID unavailable"
  );
}

export function SettingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  const [productType, setProductType] = useState<ProductType>("go");
  const [orderAccessId, setOrderAccessId] = useState("Order Access ID unavailable");
  const [saved, setSaved] = useState(false);
  const [resetNotice, setResetNotice] = useState("");

  const productName = productType === "pro" ? "Voice Flex PRO" : "Voice Flex GO";

  useEffect(() => {
    const nextSettings = safeReadSettings();
    const nextProduct = getRouteProduct(pathname) ?? getLocalProduct();
    const nextOrderAccessId = getLocalOrderAccessId();

    setSettings(nextSettings);
    setProductType(nextProduct);
    setOrderAccessId(nextOrderAccessId);
  }, [pathname]);

  const defaultDevice = useMemo(() => productName, [productName]);

  function handleSave() {
    saveLocalSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function handleResetPreferences() {
    const confirmed = window.confirm("Reset local setup and return to onboarding?");
    if (!confirmed) return;

    const nextSettings = { ...defaultSettings };

    trainingProgressStore.resetProgress(productType);
    resetAllLocalMilestones();
    setSettings(nextSettings);
    saveLocalSettings(nextSettings);
    setSaved(false);
    router.push(`/train/${productType}`);
  }

  function handleLogout() {
    router.push("/");
  }

  return (
        <div className="mx-auto max-w-[1180px] space-y-7">
          <section className="rounded-[22px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:p-8">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <SectionTitle icon={<User className="h-8 w-8" />} title="Profile" subtitle="Manage your name and account details." />
              <button
                type="button"
                onClick={handleSave}
                className="h-11 rounded-lg bg-[#0f63f4] px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-[#0b55d6]"
              >
                {saved ? "Saved" : "Save Changes"}
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1px_1fr]">
              <div>
                <label className="text-sm font-black text-slate-950" htmlFor="display-name">
                  Display Name
                </label>
                <input
                  id="display-name"
                  value={settings.displayName}
                  onChange={(event) => setSettings({ ...settings, displayName: event.target.value })}
                  className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-3 text-sm text-slate-600">This is how your name will appear in the app.</p>
              </div>

              <div className="hidden bg-slate-200 lg:block" />

              <div className="space-y-6">
                <FieldSelect label="Default Device" value={defaultDevice} helper="Based on your order. You can only use your purchased device." disabled />
                <div>
                  <label className="text-sm font-black text-slate-950" htmlFor="order-access-id">
                    Order Access ID
                  </label>
                  <input
                    id="order-access-id"
                    value={orderAccessId}
                    disabled
                    className="mt-3 h-12 w-full rounded-lg border border-slate-300 bg-slate-100 px-4 text-base font-medium text-slate-500"
                  />
                  <p className="mt-3 text-sm text-slate-600">This ID is linked to your Voice Flex product.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:p-8">
            <SectionTitle icon={<SlidersHorizontal className="h-8 w-8" />} title="Preferences" subtitle="Customize your app experience." />

            <div className="mt-8 divide-y divide-slate-200">
              <PreferenceRow
                title="Reset Local Preferences"
                description="This will reset local setup and preferences on this device."
                control={
                  <button
                    type="button"
                    onClick={handleResetPreferences}
                    className="h-11 rounded-lg border border-red-500 px-5 text-sm font-black text-red-600 transition hover:bg-red-50"
                  >
                    Reset Preferences
                  </button>
                }
              />
            </div>
            {resetNotice ? (
              <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                {resetNotice}
              </p>
            ) : null}
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:p-8">
            <SectionTitle icon={<Info className="h-8 w-8" />} title="About" subtitle="App information and support." />
            <div className="mt-7 divide-y divide-slate-200 text-sm">
              <InfoRow label="Version" value="1.0.0" />
              <InfoRow label="Product" value="Voice Flex App" />
            </div>
          </section>

          <div className="flex justify-center pb-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 w-full max-w-[560px] items-center justify-center gap-3 rounded-lg border border-red-500 bg-white text-sm font-black text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
  );
}


function SectionTitle({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-5">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">{icon}</span>
      <div>
        <h2 className="text-2xl font-black tracking-[-0.02em]">{title}</h2>
        <p className="mt-1 text-base text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldSelect({ label, value, helper, disabled }: { label: string; value: string; helper: string; disabled?: boolean }) {
  return (
    <div>
      <label className="text-sm font-black text-slate-950">{label}</label>
      <div className="relative mt-3">
        <select
          value={value}
          disabled={disabled}
          onChange={() => undefined}
          className="h-12 w-full appearance-none rounded-lg border border-slate-300 bg-slate-100 px-4 pr-10 text-base font-medium text-slate-500"
        >
          <option>{value}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      <p className="mt-3 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function PreferenceRow({ title, description, control }: { title: string; description: string; control: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {control}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="font-black text-slate-950">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
