"use client";

import Link from "next/link";
import { Waves } from "lucide-react";

import { getProductName, type VoiceFlexProduct } from "@/lib/training-product";
import { cn } from "@/lib/utils";

type TrainingSidebarItem = "setup" | "sessions" | "library" | "progress" | "milestones" | "settings";

const TRAINING_NAV_ITEMS: Array<{
  id: TrainingSidebarItem;
  label: string;
  shortLabel: string;
  href: (productType: VoiceFlexProduct) => string;
}> = [
  { id: "setup", label: "\u{1F680} Guide", shortLabel: "Guide", href: (productType) => `/train/${productType}?setup=1` },
  { id: "sessions", label: "\u{1F399}️ Routines", shortLabel: "Routines", href: (productType) => `/train/${productType}` },
  { id: "library", label: "\u{1F4DA} Library", shortLabel: "Library", href: (productType) => `/train/${productType}/library` },
  { id: "progress", label: "\u{1F4CA} Progress", shortLabel: "Progress", href: (productType) => `/train/${productType}/progress` },
  { id: "milestones", label: "\u{1F3C6} Milestones", shortLabel: "Milestones", href: (productType) => `/train/${productType}/milestones` },
  { id: "settings", label: "⚙️ Settings", shortLabel: "Settings", href: (productType) => `/train/${productType}/settings` }
];

function productLabel(productType: VoiceFlexProduct) {
  return getProductName(productType);
}

export function TrainingSidebar({
  productType,
  activeItem,
  mobileNav = true
}: {
  productType: VoiceFlexProduct;
  activeItem: TrainingSidebarItem;
  /** Small tab row at the top of the page on phones. The session player has its own header. */
  mobileNav?: boolean;
}) {
  return (
    <>
      {mobileNav ? (
        <nav className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-200 bg-white px-2 py-3 min-[400px]:gap-1 min-[400px]:px-3 lg:hidden" aria-label="Training">
          {TRAINING_NAV_ITEMS.filter((item) => item.id !== "setup").map((item) => (
            <Link
              key={item.id}
              href={item.href(productType)}
              aria-current={item.id === activeItem ? "page" : undefined}
              className={cn(
                "flex-1 shrink-0 whitespace-nowrap rounded-xl px-1.5 py-2 text-center text-[12px] font-black text-slate-600 min-[400px]:px-2 min-[400px]:text-sm",
                item.id === activeItem && "bg-electric-600 text-white"
              )}
            >
              {item.shortLabel}
            </Link>
          ))}
        </nav>
      ) : null}

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

            return (
              <Link className={className} href={item.href(productType)} key={item.id} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/75">
          <p className="font-black text-white">{productLabel(productType)}</p>
        </div>
      </aside>
    </>
  );
}
