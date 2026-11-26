"use client";

import { useEffect, useState, type ReactNode } from "react";

import { syncTrainingProgress, wasSyncedRecently } from "@/lib/cloud-sync";
import { LOCAL_CHANGE_EVENT } from "@/lib/local-change";
import type { VoiceFlexProduct } from "@/lib/training-product";

/** Longest wait for the account before the page opens with what this device has. */
const OPEN_TIMEOUT_MS = 2500;
const SAVE_DELAY_MS = 1500;

/**
 * Wraps the training pages: pulls the person's saved history from their account before the page
 * opens (so a new device shows their progress), and saves setting changes back a moment later.
 */
export function CloudSyncGate({ productType, children }: { productType: VoiceFlexProduct; children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let openTimer: number | undefined;

    if (wasSyncedRecently(productType)) {
      setReady(true);
    } else {
      openTimer = window.setTimeout(() => {
        if (!cancelled) setReady(true);
      }, OPEN_TIMEOUT_MS);
      void syncTrainingProgress(productType).finally(() => {
        window.clearTimeout(openTimer);
        if (!cancelled) setReady(true);
      });
    }

    let saveTimer: number | undefined;
    const onLocalChange = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => void syncTrainingProgress(productType), SAVE_DELAY_MS);
    };
    window.addEventListener(LOCAL_CHANGE_EVENT, onLocalChange);

    return () => {
      cancelled = true;
      window.clearTimeout(openTimer);
      window.clearTimeout(saveTimer);
      window.removeEventListener(LOCAL_CHANGE_EVENT, onLocalChange);
    };
  }, [productType]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Loading your progress...</div>
      </main>
    );
  }

  return <>{children}</>;
}
