import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="mt-3 text-slate-600">Demo authentication is disabled for this MVP.</p>
        <Button asChild className="mt-8 w-full"><Link href="/dashboard">Enter Voice Flex</Link></Button>
      </div>
    </main>
  );
}
