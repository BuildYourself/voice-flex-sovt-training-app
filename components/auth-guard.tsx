"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Waves } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setReady(true);
    };

    checkAuth();
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
