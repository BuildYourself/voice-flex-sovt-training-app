import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  Heart,
  Lock,
  Play,
  QrCode,
  ShieldCheck,
  ShoppingCart,
  Star,
  Timer,
  Trophy,
  TrendingUp,
  Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const stats = [
  { title: "21-Day Program", description: "Step-by-step transformation", icon: CalendarDays, tone: "bg-blue-50 text-electric-600" },
  { title: "245", titleSuffix: "Training Minutes", description: "Building stronger habits", icon: Clock, tone: "bg-blue-50 text-electric-600" },
  { title: "12", titleSuffix: "Day Streak", description: "Consistency that counts", icon: Flame, tone: "bg-emerald-50 text-emerald-700" },
  { title: "Guided Daily Sessions", description: "Short, focused, effective", icon: CheckCircle2, tone: "bg-purple-50 text-purple-700" },
  { title: "Build Control", description: "Strengthen breath, tone, and pitch with precision.", icon: Waves, tone: "bg-emerald-50 text-emerald-600" },
  { title: "Expand Range", description: "Safely reach higher and sing with more freedom.", icon: TrendingUp, tone: "bg-blue-50 text-electric-600" },
  { title: "Warm Up Faster", description: "Smart warm-ups that get you ready to perform.", icon: Timer, tone: "bg-purple-50 text-purple-700" },
  { title: "Recover with Less Strain", description: "Train efficiently and protect your voice for the long run.", icon: Heart, tone: "bg-pink-50 text-pink-600" }
];

const steps = [
  { title: "1. Buy the Product", description: "Choose Voice Flex GO or the Pro Kit.", icon: ShoppingCart, tone: "bg-blue-50 text-electric-600" },
  { title: "2. Scan & Log In", description: "Scan the QR code or visit voiceflex.training to access your training hub.", icon: QrCode, tone: "bg-emerald-50 text-emerald-600" },
  { title: "3. Follow Daily Sessions", description: "Short, guided sessions designed to build real, lasting results.", icon: Play, tone: "bg-blue-50 text-electric-600" },
  { title: "4. Reach Your Milestone", description: "Track progress, unlock new modules, and become your best voice.", icon: Trophy, tone: "bg-amber-50 text-amber-600" }
];

const products = [
  {
    title: "Voice Flex GO",
    subtitle: "The essential daily trainer.",
    price: "$49",
    cta: "Buy on Amazon",
    variant: "green",
    bullets: ["1x Voice Flex GO Device", "Access to 21-Day Program", "Daily Guided Sessions", "Progress Tracking"]
  },
  {
    title: "Voice Flex Pro Kit",
    subtitle: "Everything you need to level up.",
    price: "$89",
    cta: "Buy on Amazon",
    variant: "outline",
    bullets: ["Voice Flex GO Device", "Premium Travel Case", "Device + Cleaning Brush", "Full 21-Day Program", "Advanced Techniques"]
  },
  {
    title: "21-Day Transformation Program",
    subtitle: "Your complete guided path.",
    price: "$39",
    cta: "Start Training",
    variant: "blue",
    popular: true,
    bullets: ["21 Days of Expert-led Training", "Step-by-Step Daily Plan", "Technique & Range Modules", "Progress Tracking & Insights", "Lifetime Access"]
  }
];

export function HomeNavbar() {
  return (
    <header className="bg-navy-950 text-white">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <Waves className="h-9 w-9 text-cyan-300" />
          <span className="text-[25px] font-black tracking-tight">Voice Flex</span>
        </Link>
        <nav className="hidden items-center gap-11 text-sm font-semibold lg:flex">
          <Link href="#products" className="flex items-center gap-1 hover:text-cyan-200">Products <ChevronDown className="h-4 w-4" /></Link>
          <Link href="#how-it-works" className="hover:text-cyan-200">How It Works</Link>
          <Link href="/dashboard" className="hover:text-cyan-200">Training</Link>
          <Link href="#reviews" className="hover:text-cyan-200">Reviews</Link>
          <Link href="#faq" className="hover:text-cyan-200">FAQ</Link>
        </nav>
        <Button asChild className="h-10 rounded-lg bg-emerald-500 px-5 text-sm font-black text-white shadow-none hover:bg-emerald-400">
          <Link href="/login">Training Hub <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </header>
  );
}

export function HomeHero() {
  return (
    <section className="mx-auto mt-6 max-w-[1180px] px-5">
      <div className="relative min-h-[520px] overflow-hidden rounded-[15px] bg-[radial-gradient(circle_at_67%_30%,rgba(31,139,255,.82),transparent_25%),linear-gradient(135deg,#07346e_0%,#00244e_45%,#000816_100%)] p-11 text-white shadow-card">
        <div className="relative z-20 max-w-[500px] pt-1">
          <h1 className="text-[36px] font-black leading-[1.04] tracking-tight text-blue-100 md:text-[55px]">
            <span className="block text-[36px] text-blue-100 md:text-[36px]">Not just a straw.</span>
            A complete voice training system.
          </h1>
          <p className="mt-6 text-xl font-black">Backed by SOVT science. Built for real results.</p>
          <p className="mt-4 max-w-[470px] text-lg leading-7 text-blue-100/90">Better control. More range. Less strain.<br />Your daily path to a stronger, more confident voice.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button className="h-[52px] rounded-lg bg-emerald-500 px-7 text-base font-black text-white hover:bg-emerald-400">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-white/20 font-black">a</span>
              Buy on Amazon
            </Button>
            <Button asChild className="h-[52px] rounded-lg bg-white px-7 text-base font-black text-electric-700 hover:bg-blue-50">
              <Link href="/login"><Play className="h-6 w-6 fill-current" />Start Training</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["bg-amber-100", "bg-rose-100", "bg-sky-100", "bg-orange-100", "bg-slate-100"].map((color, index) => (
                <span key={color} className={cn("grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xs font-bold text-navy-900", color)}>{["A", "M", "J", "S", "K"][index]}</span>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-amber-300">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-5 w-5 fill-current" />)}</div>
              <p className="mt-1 text-sm font-semibold text-blue-50">Loved by singers, speakers & pros</p>
              <p className="text-sm text-blue-100">4.9/5 from 1,200+ reviews</p>
            </div>
          </div>
        </div>
        <HeroSinger />
        <MiniDashboardPreview className="absolute bottom-8 right-[160px] z-30 hidden w-[500px] lg:block" />
      </div>
    </section>
  );
}

function HeroSinger() {
  return (
    <div className="absolute inset-y-0 right-0 z-10 hidden w-[45%] overflow-hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent" />
      <div className="absolute right-8 top-[-34px] h-[580px] w-[340px] rounded-b-full bg-gradient-to-b from-slate-300 via-slate-900 to-black shadow-2xl" />
      <div className="absolute right-[200px] top-[64px] h-[330px] w-12 rounded-full bg-gradient-to-b from-slate-200 to-slate-900 shadow-2xl" />
      <div className="absolute right-[178px] top-[204px] h-3 w-40 bg-slate-950" />
      <div className="absolute right-[84px] top-[14px] h-[122px] w-[100px] rounded-full bg-gradient-to-br from-amber-100 via-rose-200 to-orange-200 shadow-xl" />
      <div className="absolute right-[70px] top-[5px] h-[140px] w-[92px] rounded-full border-[13px] border-slate-950 bg-slate-900" />
      <div className="absolute right-[32px] top-[190px] h-40 w-32 rotate-[-28deg] rounded-full border-[18px] border-slate-900/90" />
      <div className="absolute right-[175px] top-[40px] h-[105px] w-[70px] rounded-full bg-slate-950/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_22%,rgba(255,255,255,.22),transparent_14%)]" />
    </div>
  );
}

function MiniDashboardPreview({ className }: { className?: string }) {
  const exercises = ["Breath & Body Reset", "Lip Trill Warm-Up", "Pitch Control Drill", "Vowel Resonance", "Cool Down & Reflect"];
  return (
    <div className={cn("rounded-2xl bg-white p-4 text-navy-950 shadow-[0_28px_70px_rgba(0,0,0,.28)]", className)}>
      <h3 className="text-lg font-black">Welcome back, Alex 👋</h3>
      <p className="text-[11px] text-slate-500">Consistency today, confidence tomorrow.</p>
      <div className="mt-4 grid grid-cols-[1.25fr_1fr] gap-3">
        <div className="rounded-xl border border-slate-100 p-3">
          <div className="mb-2 flex justify-between text-[11px] font-bold"><span>Your Daily Plan</span><span className="text-slate-400">Est. 35 min</span></div>
          {exercises.map((item, index) => (
            <div key={item} className="grid grid-cols-[20px_30px_1fr_20px] items-center gap-2 border-b border-slate-100 py-1.5 last:border-0">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-slate-500">{index + 1}</span>
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg", index === 0 ? "bg-emerald-100 text-emerald-700" : index === 4 ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-electric-700")}><Waves className="h-4 w-4" /></span>
              <div><p className="text-[11px] font-bold">{item}</p><p className="text-[9px] text-slate-500">{index === 2 ? "10" : index === 3 ? "8" : "5"} min</p></div>
              {index < 2 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : index === 2 ? <Play className="h-4 w-4 text-electric-600" /> : <Lock className="h-4 w-4 text-slate-300" />}
            </div>
          ))}
          <p className="mt-3 text-[11px] font-bold text-electric-700">View full plan →</p>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="text-[11px] font-bold">21-Day Transformation Program</p>
            <p className="mt-1 text-lg font-black">Day 12 of 21</p>
            <div className="mt-2 flex items-center gap-2"><Progress value={57} className="h-2" indicatorClassName="bg-cyan-400" /><span className="text-[10px] font-bold text-electric-700">57%</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["12", "Day Streak", "bg-emerald-50"],
              ["245", "Total Minutes", "bg-blue-50"],
              ["18", "Sessions Completed", "bg-purple-50"],
              ["Day 14", "Next Milestone", "bg-amber-50"]
            ].map(([value, label, bg]) => (
              <div key={label} className={cn("rounded-xl p-3", bg)}>
                <p className="text-lg font-black">{value}</p>
                <p className="text-[10px] font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureStatsGrid() {
  return (
    <section className="mx-auto mt-4 grid max-w-[1180px] grid-cols-1 gap-4 px-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div key={`${item.title}-${item.description}`} className="flex min-h-[90px] items-center gap-5 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full", item.tone)}><Icon className="h-6 w-6" /></span>
            <div>
              <h3 className="text-[17px] font-black leading-tight text-navy-950">{item.title}</h3>
              {item.titleSuffix && <p className="font-black leading-tight text-navy-950">{item.titleSuffix}</p>}
              <p className="mt-1 text-sm leading-5 text-slate-600">{item.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto mt-5 max-w-[960px] px-5 text-center">
      <h2 className="text-[23px] font-black text-navy-950">How It Works</h2>
      <div className="relative mt-4 grid gap-8 md:grid-cols-4">
        <div className="absolute left-[13%] right-[13%] top-7 hidden h-px bg-slate-300 md:block" />
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative z-10">
              <span className={cn("mx-auto grid h-14 w-14 place-items-center rounded-full", step.tone)}><Icon className="h-7 w-7" /></span>
              <h3 className="mt-6 text-sm font-black text-navy-950">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[170px] text-sm leading-5 text-slate-600">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ProductCards() {
  return (
    <section id="products" className="mx-auto mt-8 grid max-w-[1180px] grid-cols-1 gap-4 px-5 xl:grid-cols-[1fr_1.25fr_1.25fr]">
      {products.map((product, index) => (
        <article key={product.title} className={cn("relative min-h-[315px] overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-card", product.popular && "border-2 border-electric-600")}>
          {product.popular && <span className="absolute left-0 top-0 rounded-br-xl bg-electric-600 px-5 py-2 text-[11px] font-black text-white">MOST POPULAR</span>}
          <div className={cn("relative z-10", product.popular && "pt-7")}>
            <h3 className="text-lg font-black text-navy-950">{product.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{product.subtitle}</p>
            <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
              {product.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{bullet}</li>
              ))}
            </ul>
          </div>
          {index === 0 && <BottleVisual className="absolute bottom-11 right-10 h-52 w-28" />}
          {index === 1 && <KitVisual />}
          {index === 2 && <ProgramPreview />}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
            <p className="text-2xl font-black text-navy-950">{product.price}</p>
            <ProductButton variant={product.variant}>{product.cta}</ProductButton>
          </div>
        </article>
      ))}
    </section>
  );
}

function ProductButton({ children, variant }: { children: React.ReactNode; variant: string }) {
  if (variant === "green") {
    return <Button className="h-10 rounded-lg bg-emerald-500 px-5 text-sm font-black hover:bg-emerald-400"><span className="font-black">a</span>{children}</Button>;
  }
  if (variant === "blue") {
    return (
      <Button asChild className="h-11 rounded-lg bg-electric-600 px-6 text-sm font-black hover:bg-electric-700">
        <Link href="/login"><Play className="h-5 w-5 fill-current" />{children}</Link>
      </Button>
    );
  }
  return <Button variant="outline" className="h-10 rounded-lg border-electric-500 px-5 text-sm font-black"><span className="font-black">a</span>{children}</Button>;
}

function BottleVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-1/2 top-0 h-8 w-14 -translate-x-1/2 rounded-full border-2 border-blue-500 bg-blue-300/35" />
      <div className="absolute left-1/2 top-4 h-[188px] w-16 -translate-x-1/2 rounded-[38px] border-2 border-blue-500 bg-gradient-to-b from-blue-200/70 via-blue-500/70 to-blue-600/80 shadow-[0_20px_45px_rgba(23,107,255,.25)]" />
      <div className="absolute left-1/2 top-20 h-20 w-11 -translate-x-1/2 rounded-full bg-white/25" />
      <p className="absolute left-1/2 top-[138px] -translate-x-1/2 text-center text-[9px] font-bold text-blue-100">Voice<br />Flex</p>
    </div>
  );
}

function KitVisual() {
  return (
    <>
      <div className="absolute bottom-16 right-40 h-44 w-24 rounded-lg bg-navy-950 p-3 text-white">
        <Waves className="h-5 w-5 text-cyan-300" />
        {["Dashboard", "Programs", "Exercises", "Progress", "Calendar", "Library", "Settings"].map((item, index) => (
          <div key={item} className={cn("mt-2 rounded-md px-2 py-1 text-[9px]", index === 0 && "bg-electric-600")}>{item}</div>
        ))}
      </div>
      <div className="absolute bottom-20 right-12 h-28 w-24 rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-700 shadow-xl">
        <p className="pt-9 text-center text-xs font-black text-cyan-300">Voice<br />Flex</p>
      </div>
      <BottleVisual className="absolute bottom-14 right-0 h-44 w-24 scale-75" />
    </>
  );
}

function ProgramPreview() {
  return (
    <div className="absolute bottom-16 right-7 w-[180px] rounded-xl border border-slate-100 bg-white p-3 shadow-card">
      <div className="grid grid-cols-2 gap-2">
        {[
          ["12", "day streak"],
          ["245", "total minutes"],
          ["12", "Day Streak"],
          ["245", "Total Minutes"]
        ].map(([value, label], index) => (
          <div key={`${value}-${label}-${index}`} className={cn("rounded-lg p-2 text-center", index === 2 ? "bg-emerald-50" : index === 3 ? "bg-blue-50" : "bg-white")}>
            <p className="text-sm font-black">{value}</p>
            <p className="text-[8px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] font-bold text-electric-700">View Progress →</p>
    </div>
  );
}

export function FinalCTA() {
  return (
    <section className="mx-auto mb-10 mt-5 max-w-[1180px] px-5">
      <div className="flex flex-col gap-8 rounded-xl bg-[radial-gradient(circle_at_73%_30%,rgba(23,107,255,.28),transparent_32%),linear-gradient(135deg,#052b5d_0%,#001733_100%)] px-14 py-12 text-white shadow-card md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[30px] font-black tracking-tight">Your best voice is built one day at a time.</h2>
          <p className="mt-4 text-base text-blue-50">Join thousands of singers, speakers, and creators transforming their voice with Voice Flex.</p>
        </div>
        <div className="min-w-[360px]">
          <Button asChild className="h-[54px] w-full rounded-lg bg-emerald-500 text-lg font-black hover:bg-emerald-400">
            <Link href="/login">Start Training Now <ArrowRight className="h-5 w-5" /></Link>
          </Button>
          <div className="mt-5 flex justify-center gap-8 text-xs text-blue-100">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />30-Day Guarantee</span>
            <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Secure & Trusted</span>
          </div>
        </div>
      </div>
    </section>
  );
}
