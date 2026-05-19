import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { TopStats } from "@/components/top-stats";
import type React from "react";

export function AppShell({ title, subtitle, children, pill }: { title: string; subtitle: string; children: React.ReactNode; pill?: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <AppSidebar />
        <main className="px-4 py-7 lg:ml-[296px] lg:px-9">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-normal text-black md:text-[34px]">{title}</h1>
              <p className="mt-1 text-lg text-slate-600">{subtitle}</p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <TopStats />
              {pill}
            </div>
          </header>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
