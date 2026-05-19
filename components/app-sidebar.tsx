"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, LogOut, Dumbbell, Home, LineChart, Settings, Sparkles, SquareLibrary, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/programs", label: "Programs", icon: SquareLibrary },
  { href: "/library", label: "Exercises", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings }
];

const AUTH_KEY = "voiceflex_auth";

interface AuthUser {
  name: string;
  email: string;
  plan: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "VF";
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>({ name: "Alex Morgan", email: "alex@example.com", plan: "Premium" });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_KEY);
      if (!raw) return;
      const auth = JSON.parse(raw) as { user?: Partial<AuthUser> };
      setUser({
        name: auth.user?.name || "Alex Morgan",
        email: auth.user?.email || "alex@example.com",
        plan: auth.user?.plan || "Premium"
      });
    } catch {
      setUser({ name: "Alex Morgan", email: "alex@example.com", plan: "Premium" });
    }
  }, []);

  const logout = () => {
    window.localStorage.removeItem(AUTH_KEY);
    router.replace("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[296px] flex-col bg-[radial-gradient(circle_at_0_0,rgba(23,107,255,.25),transparent_34%),linear-gradient(180deg,#001a3a_0%,#001733_100%)] px-4 py-8 text-white lg:flex">
      <Link href="/dashboard" className="mb-10 flex items-center gap-3 px-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-cyan-300">
          <Waves className="h-9 w-9" />
        </div>
        <span className="text-3xl font-bold">Voice Flex</span>
      </Link>

      <nav className="space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname === "/session" && item.href === "/dashboard");
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "flex h-14 items-center gap-4 rounded-xl px-5 text-lg font-semibold text-white/92 transition hover:bg-white/8",
                active && "bg-electric-600 shadow-lg shadow-blue-950/25"
              )}
            >
              <Icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-8">
        <div className="mx-1 rounded-2xl bg-gradient-to-br from-electric-600 via-electric-700 to-navy-800 p-6 shadow-2xl shadow-blue-950/30">
          <Sparkles className="ml-auto h-7 w-7 text-cyan-300" />
          <h3 className="mt-1 max-w-[160px] text-2xl font-bold leading-tight">Unlock your best voice</h3>
          <p className="mt-4 text-base leading-6 text-white/90">Upgrade to Premium for advanced feedback, custom plans, and more.</p>
          <Button className="mt-6 bg-cyan-300 px-8 text-navy-900 hover:bg-cyan-200">Upgrade Now</Button>
        </div>

        <div className="flex items-center gap-3 px-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-white/25 bg-gradient-to-br from-white to-blue-100 text-xl font-bold text-navy-900">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1" title={user.email}>
            <p className="truncate text-lg font-bold">{user.name}</p>
            <p className="text-base font-medium text-cyan-300">{user.plan}</p>
            <p className="truncate text-xs text-white/55">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="grid h-10 w-10 place-items-center rounded-xl text-white/75 transition hover:bg-white/10 hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
