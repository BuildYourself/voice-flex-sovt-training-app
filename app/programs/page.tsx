import { AppShell } from "@/components/app-shell";
import { ProgramsGrid } from "@/components/programs/programs-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedPrograms } from "@/lib/programs-db";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  let programs = [] as Awaited<ReturnType<typeof getPublishedPrograms>>;
  let fetchError: string | null = null;

  try {
    programs = await getPublishedPrograms();
  } catch (error: any) {
    fetchError = error?.message ?? "Unknown programs fetch error";
  }

  const guidedPrograms = programs
    .filter((program) => program.slug !== "voice-flex-pro")
    .sort((a, b) => {
      const aAvailable = a.slug === "transformation-21" || a.title === "21-Day Transformation" ? 0 : 1;
      const bAvailable = b.slug === "transformation-21" || b.title === "21-Day Transformation" ? 0 : 1;
      return aAvailable - bAvailable || (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

  return (
    <AppShell title="Choose Your Path" subtitle="Start where you are. Follow the system. Build your best voice.">
      <Card>
        <CardHeader>
          <CardTitle>Guided Programs</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-700">Programs fetch error: {fetchError}</div>
          ) : guidedPrograms.length > 0 ? (
            <ProgramsGrid programs={guidedPrograms} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">No programs found.</div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
