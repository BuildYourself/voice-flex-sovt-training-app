"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Flag, MessageCircle, Mic, ShieldCheck, Trophy, Waves, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DbProgram } from "@/lib/programs-client";
import { setSelectedProgramSlugToStorage } from "@/lib/programs-client";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const iconMap = {
  microphone: Mic,
  waves: Waves,
  heart: Heart,
  "message-circle": MessageCircle,
  trophy: Trophy,
  "shield-check": ShieldCheck
} as const;

const colorClasses: Record<string, string> = {
  purple: "bg-purple-50 text-purple-800 border-purple-100",
  green: "bg-emerald-50 text-emerald-800 border-emerald-100",
  pink: "bg-pink-50 text-pink-800 border-pink-100",
  blue: "bg-blue-50 text-blue-800 border-blue-100",
  yellow: "bg-amber-50 text-amber-800 border-amber-100",
  navy: "bg-slate-50 text-slate-900 border-slate-200"
};

export function ProgramsGrid({ programs }: { programs: DbProgram[] }) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {programs.map((program) => {
        const Icon = iconMap[program.icon as keyof typeof iconMap] ?? Waves;
        return (
          <div
            key={program.id}
            className={cn(
              "rounded-2xl border p-5",
              program.is_featured ? "bg-gradient-to-br from-[#073b7d] to-navy-950 text-white" : colorClasses[program.color_theme] ?? colorClasses.blue
            )}
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/35">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-black">{program.title}</h3>
            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {program.duration_days} Days
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {program.difficulty}
              </p>
              <p className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                {program.description}
              </p>
            </div>
            <Button
              variant={program.is_featured ? "default" : "outline"}
              className="mt-7 w-full"
              onClick={async () => {
                setSelectedProgramSlugToStorage(program.slug);
                const supabase = createClient();
                const {
                  data: { user }
                } = await supabase.auth.getUser();
                if (user) {
                  await supabase
                    .from("user_progress")
                    .upsert(
                      {
                        user_id: user.id,
                        current_program_id: program.id,
                        current_day: 1,
                        updated_at: new Date().toISOString()
                      },
                      { onConflict: "user_id" }
                    )
                    .select("*");
                }
                router.push("/dashboard");
              }}
            >
              Start Program
            </Button>
          </div>
        );
      })}
    </div>
  );
}


