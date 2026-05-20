"use client";

import { FormEvent, useEffect, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, EyeOff, Info, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "login" | "create";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const next = params.get("next") || "/dashboard";

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/dashboard");
    };
    checkSession();
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        router.replace(next.startsWith("/") ? next : "/dashboard");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: name.trim()
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      setMessage("Check your email to confirm your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_12%,rgba(23,107,255,.08),transparent_30%),linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)] px-5 py-10">
      <section className="w-full max-w-[720px] rounded-[26px] border border-slate-200 bg-white/95 p-11 shadow-[0_24px_70px_rgba(15,23,42,.12)]">
        <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={cn(
              "h-[66px] rounded-[10px] text-xl font-black text-slate-600 transition",
              mode === "login" && "border-b-4 border-electric-600 bg-white text-electric-700 shadow-sm"
            )}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setError("");
            }}
            className={cn(
              "h-[66px] rounded-[10px] text-xl font-black text-slate-600 transition",
              mode === "create" && "border-b-4 border-electric-600 bg-white text-electric-700 shadow-sm"
            )}
          >
            Create Account
          </button>
        </div>

        <div className="mt-12">
          <h1 className="text-[31px] font-black tracking-tight text-navy-950">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
              <p className="mt-2 text-xl text-slate-600">{mode === "login" ? "Log in to access your training hub" : "Create your Voice Flex training hub"}</p>
        </div>

        <form onSubmit={submit} className="mt-12 space-y-8">
          {mode === "create" && (
            <label className="block">
              <span className="text-base font-black text-navy-950">Name</span>
              <div className="mt-3 flex h-[68px] items-center gap-4 rounded-xl border border-slate-200 px-6 text-slate-500 shadow-sm focus-within:border-electric-500">
                <User className="h-6 w-6 text-slate-400" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-slate-400"
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-base font-black text-navy-950">Email</span>
            <div className="mt-3 flex h-[68px] items-center gap-4 rounded-xl border border-slate-200 px-6 text-slate-500 shadow-sm focus-within:border-electric-500">
              <Mail className="h-6 w-6 text-slate-400" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-slate-400"
                placeholder="Enter your email address"
                type="email"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-navy-950">Password</span>
              {mode === "login" && <button type="button" className="text-base font-semibold text-electric-700">Forgot password?</button>}
            </div>
            <div className="mt-3 flex h-[68px] items-center gap-4 rounded-xl border border-slate-200 px-6 text-slate-500 shadow-sm focus-within:border-electric-500">
              <Lock className="h-6 w-6 text-slate-400" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-slate-400"
                placeholder="Enter your password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <EyeOff className="h-6 w-6 text-slate-400" />
            </div>
          </label>

          <div className="flex items-center justify-between text-base text-slate-600">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 accent-electric-600" />
              <span>Remember me</span>
            </label>
            <span className="flex items-center gap-2">Keep me signed in <Info className="h-5 w-5 text-slate-400" /></span>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
          {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}

          <Button disabled={loading} type="submit" className="h-[72px] w-full rounded-xl bg-electric-600 text-2xl font-black shadow-lg shadow-blue-200 hover:bg-electric-700">
            Continue to Dashboard <ArrowRight className="h-8 w-8" />
          </Button>
        </form>

        <div className="mt-9 flex items-center gap-8 rounded-2xl border border-slate-200 bg-blue-50/45 p-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blue-100 text-electric-700">
            <ShieldCheck className="h-12 w-12" />
          </span>
          <div>
            <h2 className="text-lg font-black text-navy-950">Secure. Private. Built for your voice journey.</h2>
            <p className="mt-2 text-lg leading-7 text-slate-600">Your data is encrypted and never shared.<br />Focus on what matters—your progress.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f8fbff]">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 font-bold text-navy-950 shadow-card">Loading Voice Flex...</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
