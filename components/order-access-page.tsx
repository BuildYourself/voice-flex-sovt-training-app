"use client";

import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OrderVerificationSuccess } from "@/components/order-verification-success";
import {
  type VerifiedOrderProduct,
  verifyOrderNumber,
} from "@/lib/order-access";
import { setActiveProduct } from "@/lib/training-product";
import { trainingProgressStore } from "@/lib/training-progress";

const productCards = [
  {
    title: "Voice Flex GO",
    badge: "GO",
    text: "Lightweight training, anywhere you go.",
    type: "go",
  },
  {
    title: "Voice Flex",
    badge: "Pro",
    text: "Complete kit for serious progress.",
    type: "pro",
  },
] as const;

const benefitItems: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Rocket,
    title: "Guided setup",
    text: "Quick start in just a few steps.",
  },
  {
    Icon: CalendarCheck,
    title: "Daily training",
    text: "Short, effective sessions.",
  },
  {
    Icon: ShieldCheck,
    title: "Progress saved",
    text: "Your training stays secure.",
  },
];

function BackgroundWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-44 top-56 h-[38rem] w-[50rem] rounded-[50%] border border-blue-100/70" />
      <div className="absolute -left-52 top-64 h-[34rem] w-[56rem] rounded-[50%] border border-blue-100/70" />
      <div className="absolute -left-60 top-72 h-[30rem] w-[62rem] rounded-[50%] border border-blue-100/70" />
      <div className="absolute -right-60 top-40 h-[42rem] w-[60rem] rounded-[50%] border border-blue-100/60" />
      <div className="absolute -right-72 top-52 h-[36rem] w-[66rem] rounded-[50%] border border-blue-100/60" />
      <div className="absolute right-0 top-0 h-80 w-[34rem] rounded-bl-[100%] bg-gradient-to-br from-orange-50 to-transparent" />
      <div className="absolute inset-x-0 top-72 h-72 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_62%)]" />
    </div>
  );
}

function ProductCard({ product }: { product: (typeof productCards)[number] }) {
  return (
    <div className="flex min-h-32 items-center gap-5 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-white">
        {product.type === "go" ? (
          <div className="grid h-20 w-12 rotate-[-12deg] place-items-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-xl">
            <Waves className="h-5 w-5" />
          </div>
        ) : (
          <div className="relative h-20 w-28">
            <div className="absolute bottom-2 left-1 h-16 w-8 rounded-xl bg-slate-950 shadow-lg" />
            <div className="absolute bottom-2 left-12 h-16 w-1.5 rounded-full bg-amber-400" />
            <div className="absolute bottom-2 left-[68px] h-16 w-1.5 rounded-full bg-slate-800" />
            <div className="absolute bottom-2 left-[88px] h-16 w-1.5 rounded-full bg-blue-500" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <h3 className="flex items-center gap-2 text-xl font-black tracking-tight text-navy-950">
          {product.title}
          <span
            className={`rounded-md px-2 py-0.5 text-sm font-black text-white ${
              product.type === "go" ? "bg-blue-600" : "bg-slate-950"
            }`}
          >
            {product.badge}
          </span>
        </h3>
        <p className="mt-1 text-base leading-6 text-slate-600">
          {product.text}
        </p>
      </div>
      <ArrowRight className="h-7 w-7 shrink-0 text-slate-500" />
    </div>
  );
}

export function OrderAccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedProduct, setVerifiedProduct] =
    useState<VerifiedOrderProduct | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!orderNumber.trim()) {
      setError("Enter your Amazon order number to continue.");
      return;
    }

    setError("");
    setIsVerifying(true);

    const result = await verifyOrderNumber(orderNumber);

    if (!result.ok) {
      setIsVerifying(false);
      setError(result.message);
      return;
    }

    const { product } = result;

    setActiveProduct(product.productType);
    trainingProgressStore.getOrCreateProgress(product.productType);
    setVerifiedProduct(product);
    setIsVerifying(false);
  }

  if (verifiedProduct) {
    return (
      <OrderVerificationSuccess
        product={verifiedProduct}
        onBack={() => {
          setVerifiedProduct(null);
          setError("");
        }}
        onContinue={() => router.push(`/train/${verifiedProduct.productType}`)}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfcff] px-6 py-10 text-navy-950">
      <BackgroundWaves />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center">
        <div className="flex w-full items-center justify-center">
          <div className="inline-flex items-center gap-3">
            <Waves className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-black tracking-tight text-navy-950">
              Voice<span className="font-semibold text-blue-600"> Flex</span>
            </span>
          </div>
          <div className="absolute right-0 top-0 hidden rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm backdrop-blur md:flex">
            No account required
          </div>
        </div>

        <section className="mt-20 text-center">
          <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-navy-950 md:text-7xl">
            Start your
            <span className="block text-blue-600">Voice Flex training</span>
          </h1>
          <p className="mt-7 text-xl leading-8 text-slate-600">
            Unlock your personalized training hub with your Amazon order number.
          </p>
        </section>

        <section className="mt-11 w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/95 p-9 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-700">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            <label
              htmlFor="amazon-order-number"
              className="block text-center text-xl font-black text-navy-950"
            >
              Amazon order number
            </label>
            <input
              id="amazon-order-number"
              value={orderNumber}
              onChange={(event) => {
                setOrderNumber(event.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. 123-4567890-1234567"
              className="mt-4 h-[60px] w-full rounded-xl border border-slate-300 bg-white px-5 text-lg font-semibold text-navy-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {error ? (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isVerifying}
              className="mt-5 inline-flex h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-xl font-black text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LockKeyhole className="h-5 w-5" />
              {isVerifying ? "Checking..." : "Open My Training"}
            </button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 text-base font-semibold text-slate-500">
            <CheckCircle2 className="h-5 w-5" />
            No email or password required.
          </div>

          <button
            type="button"
            onClick={() => setShowHelp((value) => !value)}
            className="mx-auto mt-4 flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800"
          >
            <HelpCircle className="h-4 w-4" />
            Where do I find my order number?
          </button>

          {showHelp ? (
            <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-center text-sm leading-6 text-slate-600">
              You can find it in your Amazon order confirmation email or in
              Your Orders on Amazon.
            </p>
          ) : null}
        </section>

        <section className="mt-8 grid w-full max-w-4xl gap-5 md:grid-cols-2">
          {productCards.map((product) => (
            <ProductCard key={product.type} product={product} />
          ))}
        </section>

        <section className="mt-10 grid w-full max-w-3xl gap-6 pb-10 md:grid-cols-3">
          {benefitItems.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-base font-black text-navy-950">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
