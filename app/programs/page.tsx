import { CalendarDays, Clock, Flag, Mic, MessageCircle, ShieldCheck, Trophy, Waves } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FeatureMarketingCard, Roadmap } from "@/components/dashboard-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { programs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = [Mic, Waves, ShieldCheck, MessageCircle, Trophy, ShieldCheck];
const colorClasses: Record<string, string> = {
  purple: "bg-purple-50 text-purple-800 border-purple-100",
  green: "bg-emerald-50 text-emerald-800 border-emerald-100",
  pink: "bg-pink-50 text-pink-800 border-pink-100",
  blue: "bg-blue-50 text-blue-800 border-blue-100",
  amber: "bg-amber-50 text-amber-800 border-amber-100"
};

export default function ProgramsPage() {
  return (
    <AppShell title="Choose Your Path" subtitle="Start where you are. Follow the system. Build your best voice.">
      <Roadmap wide />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Guided Programs</CardTitle>
          <span className="text-sm font-bold text-electric-700">View all programs</span>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {programs.map((program, index) => {
            const Icon = icons[index];
            return (
              <div key={program.id} className={cn("rounded-2xl border p-5", program.featured ? "bg-gradient-to-br from-[#073b7d] to-navy-950 text-white" : colorClasses[program.colorTheme])}>
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/35"><Icon className="h-7 w-7" /></div>
                <h3 className="mt-5 text-lg font-black">{program.title}</h3>
                <div className="mt-6 space-y-3 text-sm">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{program.durationDays} Days</p>
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{program.difficulty}</p>
                  <p className="flex items-center gap-2"><Flag className="h-4 w-4" />{program.description}</p>
                </div>
                <Button variant={program.featured ? "default" : "outline"} className="mt-7 w-full">{program.featured ? "Start Program" : "Start Program"}</Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-6 2xl:grid-cols-[1fr_1.08fr_1.52fr]">
        <Card>
          <CardHeader><CardTitle>How Voice Flex Works</CardTitle></CardHeader>
          <CardContent className="grid gap-5 text-center sm:grid-cols-3">
            {[
              ["1. Follow the guided session", "Short, focused lessons that build the right skills in the right order.", "▶"],
              ["2. Stay consistent with the calendar", "Daily practice builds momentum and turns skills into habits.", "▣"],
              ["3. Reach your next milestone", "Track progress, unlock achievements, and celebrate wins.", "★"]
            ].map(([title, text, icon]) => (
              <div key={title}>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-2xl text-electric-600">{icon}</div>
                <p className="mt-7 font-bold">{title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <FeatureMarketingCard />
        <Card>
          <CardContent className="grid gap-6 p-7 md:grid-cols-[1fr_220px]">
            <div>
              <h3 className="text-2xl font-black leading-tight text-navy-900">Your Voice Flex account unlocks your guided training system</h3>
              <ul className="mt-6 space-y-4 text-slate-700">
                <li>Access all programs and exercises</li>
                <li>Sync your progress across devices</li>
                <li>Personalized recommendations</li>
                <li>Secure, private, and always with you</li>
              </ul>
            </div>
            <div className="space-y-4">
              <Button className="w-full">Log In</Button>
              <Button variant="outline" className="w-full">Sign Up</Button>
              <div className="rounded-xl border border-slate-200 p-4 text-center">
                <div className="mx-auto grid h-24 w-24 grid-cols-4 gap-1 bg-white p-2">
                  {Array.from({ length: 16 }, (_, index) => <span key={index} className={cn("bg-black", index % 3 === 0 && "bg-white")} />)}
                </div>
                <p className="mt-2 text-sm font-semibold">Scan to access on mobile</p>
                <p className="text-xs text-slate-500">voiceflex.app</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
