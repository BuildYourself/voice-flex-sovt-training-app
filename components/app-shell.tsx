import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { TopStats } from "@/components/top-stats";
import { Waves } from "lucide-react";
import Link from "next/link";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import type React from "react";

export function AppShell({
  title,
  subtitle,
  children,
  pill,
  topStats,
  showTopStats = true
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  pill?: React.ReactNode;
  topStats?: { dayStreak: number; totalMinutes: number };
  showTopStats?: boolean;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen overflow-x-hidden">
        <AppSidebar />
        <MobileHeader topStats={topStats} showTopStats={showTopStats} />
        <main className="px-4 pb-28 pt-4 sm:px-6 lg:ml-[272px] lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1780px]">
          <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between lg:mb-9">
            <div>
              <h1 className="text-[28px] font-black leading-tight tracking-normal text-black md:text-[32px] xl:text-[34px]">{title}</h1>
              <p className="mt-1.5 text-base text-slate-600 md:text-lg">{subtitle}</p>
            </div>
            {(showTopStats || pill) && (
              <div className="hidden flex-col items-end gap-4 md:flex">
                {showTopStats && <TopStats initial={topStats} />}
                {pill}
              </div>
            )}
            {pill && <div className="md:hidden">{pill}</div>}
          </header>
          {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}

function MobileHeader({ topStats, showTopStats }: { topStats?: { dayStreak: number; totalMinutes: number }; showTopStats: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-black text-navy-950">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-navy-950 text-cyan-300"><Waves className="h-6 w-6" /></span>
          Voice Flex
        </Link>
        {showTopStats && <TopStats initial={topStats} />}
      </div>
    </header>
  );
}
