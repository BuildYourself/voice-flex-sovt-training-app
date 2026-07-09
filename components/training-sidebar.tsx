"use client";

import Link from "next/link";
import { Waves } from "lucide-react";

import type { VoiceFlexProduct } from "@/lib/training-product";
import { cn } from "@/lib/utils";

type TrainingSidebarItem = "setup" | "sessions" | "progress" | "milestones" | "settings";

const TRAINING_NAV_ITEMS: Array<{
  id: TrainingSidebarItem;
  label: string;
  href: (productType: VoiceFlexProduct) => string;
}> = [
  { id: "setup", label: "\u{1F680} Setup", href: (productType) => `/train/${productType}` },
  { id: "sessions", label: "\u{1F399}\uFE0F Sessions", href: (productType) => `/train/${productType}` },
  { id: "progress", label: "\u{1F4CA} Progress", href: (productType) => `/train/${productType}/progress` },
  { id: "milestones", label: "\u{1F3C6} Milestones", href: (productType) => `/train/${productType}/milestones` },
  { id: "settings", label: "\u2699\uFE0F Settings", href: (productType) => `/train/${productType}/settings` }
];

function productLabel(productType: VoiceFlexProduct) {
  return productType === "go" ? "Voice Flex GO" : "Voice Flex Pro";
}

export function TrainingSidebar({
  productType,
  activeItem
}: {
  productType: VoiceFlexProduct;
  activeItem: TrainingSidebarItem;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[272px] bg-navy-950 px-5 py-8 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 text-2xl font-black">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-300">
          <Waves className="h-7 w-7" />
        </span>
        Voice Flex
      </div>

      <nav className="mt-10 space-y-2">
        {TRAINING_NAV_ITEMS.map((item) => {
          const active = item.id === activeItem;
          const className = cn(
            "block rounded-2xl px-4 py-4 font-bold text-white/75 hover:bg-white/10",
            active && "bg-electric-600 font-black text-white hover:bg-electric-600"
          );

          if (active) {
            return (
              <div className={className} key={item.id}>
                {item.label}
              </div>
            );
          }

          return (
            <Link className={className} href={item.href(productType)} key={item.id}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/75">
        <p className="font-black text-white">{productLabel(productType)}</p>
        <p className="mt-2">No account required. Progress saved on this device.</p>
      </div>
    </aside>
  );
}
