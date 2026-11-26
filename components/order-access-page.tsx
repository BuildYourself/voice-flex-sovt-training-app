"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  UserPlus,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OrderVerificationSuccess } from "@/components/order-verification-success";
import { syncTrainingProgress } from "@/lib/cloud-sync";
import {
  type OrderProductChoice,
  type OrderProfileChoice,
  type VerifiedOrderProduct,
  type VerifyOrderOptions,
  verifyOrderNumber,
} from "@/lib/order-access";
import { getCapColoursForOrder, getDefaultKit, setStoredKit } from "@/lib/kits";
import { setOrderAsin, setOrderSource } from "@/lib/review-request";
import { setTrainingIdentity } from "@/lib/training-identity";
import { setActiveProduct, type VoiceFlexProduct } from "@/lib/training-product";
import { trainingProgressStore } from "@/lib/training-progress";

const ORDER_ACCESS_ID_KEY = "voiceflex_order_access_id";
const SETTINGS_KEY = "voiceflex_settings";

const PRODUCT_IMAGES: Record<VoiceFlexProduct, string> = {
  go: "/images/voiceflexgo.png",
  pro: "/images/voiceflexpro-caps.webp",
  core: "/images/voiceflexcore.webp",
};

/** Order holds two products, or 2+ units of one: ask before opening the training. */
type OrderChoice =
  | { kind: "product"; orderNumber: string; products: OrderProductChoice[] }
  | {
      kind: "profile";
      orderNumber: string;
      productType: VoiceFlexProduct;
      productName: string;
      seats: number;
      profiles: OrderProfileChoice[];
    };

function shortDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** A new person's first name becomes their display name, unless they already set one. */
function applyNameAsDisplayName(name: string) {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? (JSON.parse(raw) as { displayName?: string }) : {};
    if (settings.displayName && settings.displayName !== "Voice Flex User") return;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, displayName: name }));
  } catch {
    // Ignore.
  }
}

const productCards = [
  {
    title: "Voice Flex GO",
    badge: "GO",
    text: "Lightweight training, anywhere you go.",
    type: "go",
    imageSrc: "/images/voiceflexgo.png",
  },
  {
    title: "Voice Flex",
    badge: "Pro",
    text: "Complete kit for serious progress.",
    type: "pro",
    imageSrc: "/images/voiceflexpro-caps.webp",
  },
  {
    title: "Voice Flex",
    badge: "CORE",
    text: "Adjustable resistance with guided vocal training.",
    type: "core",
    imageSrc: "/images/voiceflexcore.webp",
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
    <div className="flex min-h-32 items-center gap-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:gap-5">
      <div className="relative grid h-24 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl sm:w-36 bg-gradient-to-br from-blue-50 via-white to-blue-50/70">
        {product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={`${product.title} ${product.badge}`}
            fill
            sizes="144px"
            className="object-contain p-2.5 drop-shadow-[0_12px_18px_rgba(37,99,235,0.18)]"
            priority={false}
          />
        ) : (
          <div className="text-center text-2xl font-black tracking-tight text-slate-950">CORE</div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-black leading-tight tracking-tight text-navy-950 sm:text-xl">
          <span className="whitespace-nowrap">{product.title}</span>
          <span
            className={`rounded-md px-2 py-0.5 text-sm font-black text-white ${
              product.type === "go" ? "bg-blue-600" : "bg-slate-950"
            }`}
          >
            {product.badge}
          </span>
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">
          {product.text}
        </p>
      </div>
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
  const [choice, setChoice] = useState<OrderChoice | null>(null);
  const [newName, setNewName] = useState("");

  async function runVerify(options: VerifyOrderOptions = {}, number = orderNumber) {
    setError("");
    setIsVerifying(true);

    const result = await verifyOrderNumber(number, options);

    if (!result.ok) {
      setIsVerifying(false);
      setError(result.message);
      return;
    }

    if (result.status === "choose_product") {
      setChoice({ kind: "product", orderNumber: result.orderNumber, products: result.products });
      setIsVerifying(false);
      return;
    }

    if (result.status === "choose_profile") {
      setChoice({
        kind: "profile",
        orderNumber: result.orderNumber,
        productType: result.productType,
        productName: result.productName,
        seats: result.seats,
        profiles: result.profiles,
      });
      setNewName("");
      setIsVerifying(false);
      return;
    }

    const { product } = result;
    const productType = product.productType;

    setActiveProduct(productType);
    setTrainingIdentity(productType, {
      orderNumber: product.orderNumber ?? number,
      profileSlot: product.profileSlot,
      profileName: product.profileName,
      seats: product.seats,
    });
    window.localStorage.setItem(ORDER_ACCESS_ID_KEY, product.orderAccessId);
    // Bring in this person's saved history first, so their own choices win over the order defaults.
    await syncTrainingProgress(productType, { timeoutMs: 3500 });
    setStoredKit(productType, product.kit ?? getDefaultKit(productType), "order", getCapColoursForOrder(product.sourceAsin));
    setOrderAsin(productType, product.sourceAsin);
    setOrderSource(productType, product.orderNumber);
    if (product.profileName) applyNameAsDisplayName(product.profileName);
    trainingProgressStore.getOrCreateProgress(productType);
    setChoice(null);
    setVerifiedProduct(product);
    setIsVerifying(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!orderNumber.trim()) {
      setError("Enter your Amazon order number to continue.");
      return;
    }

    await runVerify();
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

        <section className="mt-11 w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/95 p-6 sm:p-9 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-700">
            <LockKeyhole className="h-7 w-7" />
          </div>

          {choice ? (
            <OrderChoicePanel
              choice={choice}
              busy={isVerifying}
              error={error}
              newName={newName}
              onNewName={setNewName}
              onPickProduct={(productType) => void runVerify({ productType }, choice.orderNumber)}
              onPickProfile={(profileSlot, profileName) =>
                choice.kind === "profile"
                  ? void runVerify({ productType: choice.productType, profileSlot, profileName }, choice.orderNumber)
                  : undefined
              }
              onBack={() => {
                setChoice(null);
                setError("");
              }}
            />
          ) : (
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
              className="mt-4 h-[60px] w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold sm:px-5 sm:text-lg text-navy-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
          )}

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
              Your Orders on Amazon. Bought on our website? Use the order
              number from your confirmation email, for example #SY1006.
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

function OrderChoicePanel({
  choice,
  busy,
  error,
  newName,
  onNewName,
  onPickProduct,
  onPickProfile,
  onBack,
}: {
  choice: OrderChoice;
  busy: boolean;
  error: string;
  newName: string;
  onNewName: (value: string) => void;
  onPickProduct: (productType: VoiceFlexProduct) => void;
  onPickProfile: (profileSlot: number, profileName?: string) => void;
  onBack: () => void;
}) {
  const optionClass =
    "flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-60";

  const freeSlot =
    choice.kind === "profile"
      ? Array.from({ length: choice.seats }, (_, index) => index + 1).find(
          (slot) => !choice.profiles.some((profile) => profile.slot === slot),
        )
      : undefined;

  return (
    <div className="mt-8">
      {choice.kind === "product" ? (
        <>
          <h2 className="text-center text-xl font-black text-navy-950">Which product are you training with?</h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">
            This order includes more than one Voice Flex product. You can open the other one later with the
            same order number.
          </p>
          <div className="mt-5 grid gap-3">
            {choice.products.map((product) => (
              <button
                key={product.productType}
                type="button"
                disabled={busy}
                onClick={() => onPickProduct(product.productType)}
                className={optionClass}
              >
                <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-blue-50/60">
                  <Image src={PRODUCT_IMAGES[product.productType]} alt="" fill sizes="80px" className="object-contain p-1.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-black text-navy-950">{product.productName}</span>
                  {product.units > 1 ? (
                    <span className="block text-sm text-slate-600">{product.units} kits on this order</span>
                  ) : null}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-center text-xl font-black text-navy-950">Who&apos;s training?</h2>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">
            This order has {choice.seats} {choice.productName} kits. Everyone gets their own progress and streak.
          </p>
          {choice.profiles.length ? (
            <div className="mt-5 grid gap-3">
              {choice.profiles.map((profile) => {
                const label = profile.name ?? `Person ${profile.slot}`;
                return (
                  <button
                    key={profile.slot}
                    type="button"
                    disabled={busy}
                    onClick={() => onPickProfile(profile.slot)}
                    className={optionClass}
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-600 text-lg font-black text-white">
                      {label.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-black text-navy-950">{label}</span>
                      <span className="block text-sm text-slate-600">
                        {profile.lastPracticeDate
                          ? `Last practice ${shortDate(profile.lastPracticeDate)} · ${profile.totalMinutes} min`
                          : "No practice yet"}
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                  </button>
                );
              })}
            </div>
          ) : null}

          {freeSlot ? (
            <form
              className="mt-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                onPickProfile(freeSlot, newName.trim() || undefined);
              }}
            >
              <label htmlFor="profile-name" className="flex items-center gap-2 text-sm font-black text-navy-950">
                <UserPlus className="h-4 w-4 text-blue-600" />
                {choice.profiles.length ? "New here? Add your first name" : "Your first name"}
              </label>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  id="profile-name"
                  value={newName}
                  maxLength={24}
                  autoComplete="given-name"
                  onChange={(event) => onNewName(event.target.value)}
                  placeholder="e.g. Anna"
                  className="h-12 w-full min-w-0 shrink-0 rounded-xl border border-slate-300 sm:w-auto sm:flex-1 bg-white px-4 text-base font-semibold text-navy-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="h-12 rounded-xl bg-blue-600 px-5 text-base font-black text-white transition hover:bg-blue-700 disabled:opacity-70"
                >
                  {busy ? "Checking..." : "Start my progress"}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-4 text-center text-sm text-slate-600">
              All {choice.seats} kits on this order have a profile. Pick yours above.
            </p>
          )}
        </>
      )}

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="mx-auto mt-5 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Use a different order number
      </button>
    </div>
  );
}
