"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import { ConfettiBackground } from "@/components/confetti-background";
import type { VerifiedOrderProduct } from "@/lib/order-access";

type OrderVerificationSuccessProps = {
  product: VerifiedOrderProduct;
  onBack: () => void;
  onContinue: () => void;
};

const benefitItems: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Sparkles,
    title: "Step-by-step guidance",
    text: "Get started in just a few simple steps.",
  },
  {
    Icon: CalendarCheck,
    title: "Daily training",
    text: "Short, effective sessions for your voice.",
  },
  {
    Icon: ShieldCheck,
    title: "Progress saved",
    text: "Your training progress stays secure and accessible.",
  },
];

function ProductVisual({ product }: { product: VerifiedOrderProduct }) {
  const imageSrc = product.productType === "pro" ? "/images/voiceflexpro.png" : "/images/voiceflexgo.png";

  return (
    <div className="relative mx-auto grid h-44 w-full max-w-md place-items-center overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white via-blue-50/70 to-white">
      <div className="absolute inset-x-0 top-24 h-20 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.18),transparent_65%)]" />
      <Image
        src={imageSrc}
        alt={product.productName}
        fill
        sizes="(max-width: 768px) 90vw, 448px"
        className="object-contain p-5 drop-shadow-[0_18px_24px_rgba(37,99,235,0.2)]"
        priority
      />
    </div>
  );
}

export function OrderVerificationSuccess({
  product,
  onBack,
  onContinue,
}: OrderVerificationSuccessProps) {
  const productDescription =
    product.productType === "pro"
      ? "Bottle + straw SOVT training with guided bubble massage setup."
      : "Lightweight, portable SOVT training wherever you are.";
  const productBadge = product.productType === "go" ? "GO" : "Pro";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfcff] px-5 py-7 text-navy-950 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute inset-x-0 top-[44%] h-72 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_66%)]" />
        <div className="absolute -left-40 top-[46%] h-[26rem] w-[44rem] rounded-[50%] border border-blue-100/70" />
        <div className="absolute -left-52 top-[50%] h-[21rem] w-[52rem] rounded-[50%] border border-blue-100/60" />
        <div className="absolute -right-48 top-[43%] h-[30rem] w-[48rem] rounded-[50%] border border-blue-100/70" />
        <div className="absolute -right-60 top-[48%] h-[24rem] w-[56rem] rounded-[50%] border border-blue-100/60" />
      </div>
      <ConfettiBackground />

      <section className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-3">
          <Waves className="h-6 w-6 text-blue-600" />
          <span className="text-2xl font-black tracking-tight text-navy-950">
            Voice<span className="font-semibold text-blue-600"> Flex</span>
          </span>
        </div>

        <div className="mt-6 grid h-20 w-20 place-items-center rounded-full bg-amber-50/80 shadow-[0_0_58px_rgba(245,158,11,0.34)]">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-blue-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
        </div>

        <h1 className="mt-5 text-5xl font-black tracking-tight text-navy-950 md:text-6xl">
          Congratulations!
        </h1>
        <p className="mt-2 text-xl font-black text-blue-600 md:text-2xl">
          Your product has been verified successfully.
        </p>
        <p className="mt-2 max-w-2xl text-lg leading-7 text-slate-600">
          Your training access is now active. Ready to strengthen your voice?
        </p>

        <div className="mt-5 w-full max-w-[560px] rounded-[2rem] border border-white/80 bg-white/85 px-7 pb-5 pt-5 shadow-[0_22px_64px_rgba(15,23,42,0.11)] backdrop-blur">
          <p className="mx-auto inline-flex rounded-xl bg-blue-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-blue-700">
            Your product
          </p>
          <h2 className="mt-3 flex items-center justify-center gap-3 text-4xl font-black tracking-tight text-navy-950">
            {product.productType === "go" ? "Voice Flex" : product.productName}
            <span
              className={`rounded-lg px-3 py-1 text-2xl font-black text-white ${
                product.productType === "go" ? "bg-blue-600" : "bg-slate-950"
              }`}
            >
              {productBadge}
            </span>
          </h2>
          <ProductVisual product={product} />
          <p className="mx-auto mt-1 max-w-md text-xl leading-7 text-slate-600">
            {productDescription}
          </p>
        </div>

        <div className="mt-5 grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {benefitItems.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="flex items-center gap-4 text-left md:border-r md:border-slate-200 md:pr-8 md:last:border-r-0"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-navy-950">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-base font-black text-navy-950">{title}</h3>
                <p className="mt-0.5 text-sm leading-5 text-slate-600">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex w-full max-w-3xl flex-col items-center gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-16 w-full items-center justify-center gap-6 rounded-2xl bg-blue-600 px-8 text-2xl font-black text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700"
          >
            Continue to Training
            <ArrowRight className="h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-base font-semibold text-blue-600 transition hover:text-blue-800"
          >
            Back to home
          </button>
        </div>
      </section>
    </main>
  );
}
