import Link from "next/link";
import { ArrowRight, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrainProductSelectionPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd] px-4 py-8 text-navy-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col">
        <header>
          <Link href="/train" className="flex items-center gap-3 font-black text-navy-950">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-950 text-cyan-300">
              <Waves className="h-7 w-7" />
            </span>
            <span className="text-2xl">Voice Flex</span>
          </Link>
        </header>

        <section className="grid flex-1 place-items-center py-12">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-card sm:p-10">
            <h1 className="text-4xl font-black tracking-normal text-navy-950 sm:text-5xl">
              Which Voice Flex product are you using?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-600">
              Choose the product from your box to open the correct setup and guided training.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <Button asChild className="h-16 rounded-2xl text-base font-black">
                <Link href="/train/pro">
                  Voice Flex Pro
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 rounded-2xl border-blue-200 text-base font-black text-electric-700">
                <Link href="/train/go">
                  Voice Flex GO
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="mt-7 text-sm leading-6 text-slate-500">
              No account or email is required. Your product choice is saved on this device only.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
