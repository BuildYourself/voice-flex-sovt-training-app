"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, CalendarDays, LogOut, Dumbbell, Home, LineChart, Settings, Sparkles, SquareLibrary, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/programs", label: "Programs", icon: SquareLibrary },
  { href: "/library", label: "Exercises", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings }
];

interface SidebarUser {
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
  const [user, setUser] = useState<SidebarUser>({ name: "Voice Flex User", email: "user@example.com", plan: "Free" });

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (!authUser) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, plan")
        .eq("id", authUser.id)
        .maybeSingle();

      setUser({
        name: profile?.full_name || authUser.email || "Voice Flex User",
        email: authUser.email || "user@example.com",
        plan: profile?.plan || "Free"
      });
    };

    loadUser();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col bg-[radial-gradient(circle_at_0_0,rgba(23,107,255,.25),transparent_34%),linear-gradient(180deg,#001a3a_0%,#001733_100%)] px-4 py-7 text-white lg:flex">
      <Link href="/dashboard" className="mb-9 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/10 text-cyan-300">
          <Waves className="h-8 w-8" />
        </div>
        <span className="text-[27px] font-bold">Voice Flex</span>
      </Link>

      <nav className="space-y-1.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (pathname === "/session" && item.href === "/dashboard");
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "flex h-[52px] items-center gap-4 rounded-xl px-4 text-base font-semibold text-white/92 transition hover:bg-white/8",
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
        <div className="mx-0 rounded-2xl bg-gradient-to-br from-electric-600 via-electric-700 to-navy-800 p-5 shadow-2xl shadow-blue-950/30">
          <Sparkles className="ml-auto h-6 w-6 text-cyan-300" />
          <h3 className="mt-1 max-w-[150px] text-[22px] font-bold leading-tight">Unlock your best voice</h3>
          <p className="mt-4 text-sm leading-6 text-white/90">Upgrade to Premium for advanced feedback, custom plans, and more.</p>
          <Button className="mt-5 h-10 bg-cyan-300 px-7 text-sm text-navy-900 hover:bg-cyan-200">Upgrade Now</Button>
        </div>

        <div className="flex items-center gap-3 px-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-white/25 bg-gradient-to-br from-white to-blue-100 text-lg font-bold text-navy-900">
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
