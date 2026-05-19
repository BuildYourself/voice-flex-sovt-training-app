"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Waves } from "lucide-react";

const AUTH_KEY = "voiceflex_auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      const auth = JSON.parse(raw) as { isLoggedIn?: boolean };
      if (!auth.isLoggedIn) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setReady(true);
    } catch {
      window.localStorage.removeItem(AUTH_KEY);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fbff]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-card">
          <Waves className="h-7 w-7 text-electric-600" />
          <span className="font-bold text-navy-950">Opening your training hub...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
