import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <h1 className="text-3xl font-black">Create your account</h1>
        <p className="mt-3 text-slate-600">Account creation will connect to Clerk in the backend phase.</p>
        <Button asChild className="mt-8 w-full"><Link href="/dashboard">Start Demo</Link></Button>
      </div>
    </main>
  );
}
