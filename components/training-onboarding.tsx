"use client";

import { useMemo, useState, type ComponentType, type Dispatch, type SetStateAction } from "react";
import { ArrowRight, Check, Menu, RotateCcw, Waves, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { onboardingCalloutIcon, onboardingVisualIcons, trainingOnboardingConfigs } from "@/lib/training-onboarding";
import type { LocalTrainingProgress } from "@/lib/training-progress";
import type { VoiceFlexProduct } from "@/lib/training-product";

type TrainingOnboardingConfig = (typeof trainingOnboardingConfigs)[VoiceFlexProduct];
type TrainingOnboardingStep = TrainingOnboardingConfig["steps"][number];
type TrainingOnboardingInfoCard = TrainingOnboardingConfig["infoCards"][number];

export function TrainingOnboarding({
  productType,
  progress,
  onComplete,
  onReset
}: {
  productType: VoiceFlexProduct;
  progress: LocalTrainingProgress;
  onComplete: () => void;
  onReset: () => void;
}) {
  const config = trainingOnboardingConfigs[productType];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = config.steps[currentStepIndex];
  const currentNumber = currentStepIndex + 1;
  const totalSteps = config.steps.length;
  const percent = Math.round((currentNumber / totalSteps) * 100);
  const VisualIcon = onboardingVisualIcons[currentStep.visualKind];
  const CalloutIcon = onboardingCalloutIcon;

  const infoCards = useMemo(() => config.infoCards, [config.infoCards]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const continueSetup = () => {
    if (currentStepIndex >= totalSteps - 1) {
      onComplete();
      return;
    }
    setCurrentStepIndex((step) => Math.min(totalSteps - 1, step + 1));
  };

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-navy-950">
      <MobileTrainingOnboarding
        config={config}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        currentNumber={currentNumber}
        totalSteps={totalSteps}
        percent={percent}
        progress={progress}
        productType={productType}
        infoCards={infoCards}
        VisualIcon={VisualIcon}
        CalloutIcon={CalloutIcon}
        menuOpen={mobileMenuOpen}
        setMenuOpen={setMobileMenuOpen}
        setCurrentStepIndex={setCurrentStepIndex}
        onContinue={continueSetup}
        onComplete={onComplete}
        onReset={onReset}
      />

      <div className="hidden lg:block">
      <aside className="fixed inset-y-0 left-0 hidden w-[272px] bg-navy-950 px-5 py-8 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3 text-2xl font-black">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-300">
            <Waves className="h-7 w-7" />
          </span>
          Voice Flex
        </div>
        <nav className="mt-10 space-y-2">
          <div className="rounded-2xl bg-electric-600 px-4 py-4 font-black">🚀 Setup</div>
          <div className="rounded-2xl px-4 py-4 font-bold text-white/75">🎙️ Sessions</div>
          <div className="rounded-2xl px-4 py-4 font-bold text-white/75">📊 Progress</div>
          <div className="rounded-2xl px-4 py-4 font-bold text-white/75">⚙️ Settings</div>
        </nav>
        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/75">
          <p className="font-black text-white">No account required</p>
          <p className="mt-2">Your progress is saved on this device only.</p>
        </div>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-[272px] lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1640px]">
          <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[30px] font-black leading-tight tracking-normal text-black md:text-[36px]">{config.title}</h1>
              <p className="mt-2 max-w-4xl text-base leading-7 text-slate-600 md:text-lg">{config.subtitle}</p>
            </div>
          </header>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-black tracking-normal text-navy-950">
                      <span className="text-electric-700">Step {currentNumber} of {totalSteps}</span> - {currentStep.label}
                    </h2>

                    <div
                      className={cn(
                        "grid grid-cols-2 gap-4",
                        totalSteps === 5 ? "md:grid-cols-5" : "md:grid-cols-6",
                      )}
                    >
                      {config.steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isComplete = index < currentStepIndex;
                        const isActive = index === currentStepIndex;
                        const canNavigate = index <= currentStepIndex;
                        return (
                          <div key={step.id} className="relative text-center">
                            {index > 0 && <div className="absolute left-[-50%] top-5 hidden h-px w-full border-t border-dashed border-slate-300 md:block" />}
                            <button
                              type="button"
                              disabled={!canNavigate}
                              aria-current={isActive ? "step" : undefined}
                              aria-label={`Go to onboarding step ${stepNumber}: ${step.label}`}
                              onClick={() => {
                                if (canNavigate) {
                                  setCurrentStepIndex(index);
                                }
                              }}
                              className={cn(
                                "relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-black",
                                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500",
                                isComplete && "bg-emerald-500 text-white",
                                isActive && "bg-electric-600 text-white",
                                !isComplete && !isActive && "bg-slate-200 text-slate-700",
                                canNavigate ? "cursor-pointer transition hover:scale-105" : "cursor-not-allowed"
                              )}
                            >
                              {isComplete ? <Check className="h-5 w-5" /> : stepNumber}
                            </button>
                            <p className={cn("mt-3 text-sm font-black leading-5", isActive ? "text-electric-700" : "text-navy-950")}>{step.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,.75fr)]">
                        <div className="relative min-h-[340px] overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                          {currentStep.imageSrc ? (
                            <>
                              <img
                                src={currentStep.imageSrc}
                                alt={currentStep.visualTitle}
                                className="h-full min-h-[340px] w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/5" />
                            </>
                          ) : (
                            <div className="relative flex h-full min-h-[340px] flex-col items-center justify-center p-8 text-center">
                              <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.14),transparent_70%)]" />
                              <div className="relative grid h-28 w-28 place-items-center rounded-[32px] bg-electric-600 text-white shadow-blue">
                                <VisualIcon className="h-14 w-14" />
                              </div>
                              <h3 className="relative mt-6 text-4xl font-black text-navy-950">{currentStep.visualTitle}</h3>
                              <p className="relative mt-2 text-lg font-semibold text-slate-600">{currentStep.visualSubtitle}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex min-h-[340px] flex-col justify-center xl:max-w-[500px]">
                          <h3 className="text-3xl font-black tracking-normal text-navy-950">{currentStep.title}</h3>
                          <p className="mt-4 text-base leading-7 text-slate-600">{currentStep.body}</p>
                          <div className="mt-5 space-y-3">
                            {currentStep.bullets.map((bullet) => (
                              <div key={bullet} className="flex gap-3 text-sm font-semibold text-slate-700">
                                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-electric-600 text-white">
                                  <Check className="h-4 w-4" />
                                </span>
                                {bullet}
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold leading-6 text-navy-950">
                            <CalloutIcon className="mt-0.5 h-5 w-5 shrink-0 text-electric-700" />
                            {currentStep.callout}
                          </div>
                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <Button className="h-12 rounded-xl font-black" onClick={continueSetup}>
                              {currentStepIndex >= totalSteps - 1 ? "Start Day 1" : "Continue Setup"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="h-12 rounded-xl border-blue-200 font-black text-electric-700" onClick={onComplete}>
                              Skip to Day 1
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 xl:grid-cols-3">
                {infoCards.map(({ Icon, title, items }) => (
                  <Card key={title}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-electric-700">
                          <Icon className="h-6 w-6" />
                        </span>
                        <h3 className="text-xl font-black text-navy-950">{title}</h3>
                      </div>
                      <div className="mt-5 space-y-3">
                        {items.map((item) => (
                          <div key={item} className="flex gap-3 text-sm font-semibold text-slate-600">
                            <Check className="h-5 w-5 shrink-0 text-electric-600" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-5 rounded-2xl bg-blue-50 p-5">
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-[10px] border-blue-200 bg-white text-2xl font-black text-navy-950">
                      {percent}%
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-electric-700">Setup Progress</h3>
                      <p className="mt-2 font-black text-navy-950">
                        {currentNumber} of {totalSteps} steps done
                      </p>
                      <p className="mt-2 text-sm text-slate-600">Keep going!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Local progress</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Current day: Day {progress.currentDay}</p>
                  <p className="text-sm leading-6 text-slate-600">Total minutes: {progress.totalMinutes}</p>
                  <Button variant="outline" className="mt-5 h-11 w-full rounded-xl font-black" onClick={onReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset setup
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}

function MobileTrainingOnboarding({
  config,
  currentStep,
  currentStepIndex,
  currentNumber,
  totalSteps,
  percent,
  progress,
  productType,
  infoCards,
  VisualIcon,
  CalloutIcon,
  menuOpen,
  setMenuOpen,
  setCurrentStepIndex,
  onContinue,
  onComplete,
  onReset,
}: {
  config: TrainingOnboardingConfig;
  currentStep: TrainingOnboardingStep;
  currentStepIndex: number;
  currentNumber: number;
  totalSteps: number;
  percent: number;
  progress: LocalTrainingProgress;
  productType: VoiceFlexProduct;
  infoCards: TrainingOnboardingInfoCard[];
  VisualIcon: ComponentType<{ className?: string }>;
  CalloutIcon: ComponentType<{ className?: string }>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  setCurrentStepIndex: Dispatch<SetStateAction<number>>;
  onContinue: () => void;
  onComplete: () => void;
  onReset: () => void;
}) {
  return (
    <div className="lg:hidden">
      <MobileSetupMenu
        open={menuOpen}
        productType={productType}
        onClose={() => setMenuOpen(false)}
        onComplete={onComplete}
      />

      <main className="min-h-screen overflow-x-hidden px-4 pb-[calc(104px+env(safe-area-inset-bottom))] pt-4">
        <header className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => window.history.back()}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl text-navy-950 shadow-sm"
          >
            ←
          </button>
          <div className="flex items-center gap-2 font-black text-navy-950">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-electric-600 text-cyan-100">
              <Waves className="h-6 w-6" />
            </span>
            Voice Flex
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-navy-950 shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <section className="mt-7">
          <h1 className="text-[32px] font-black leading-[1.08] tracking-normal text-navy-950">
            {config.title}
          </h1>
          <p className="mt-3 text-[17px] leading-7 text-slate-600">{config.subtitle}</p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3">
          <MobileProgressCard percent={percent} currentNumber={currentNumber} totalSteps={totalSteps} />
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
            <h2 className="text-sm font-black text-navy-950">Local Progress</h2>
            <div className="mt-4 flex gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-electric-700">
                📅
              </span>
              <div className="min-w-0 text-sm leading-6 text-slate-700">
                <p>Current day: Day {progress.currentDay}</p>
                <p>Total minutes: {progress.totalMinutes}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white text-sm font-black text-electric-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset setup
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-xl font-black text-navy-950">
            <span className="text-electric-700">Step {currentNumber} of {totalSteps}</span> - {currentStep.label}
          </h2>

          <MobileSetupStepper
            steps={config.steps}
            currentStepIndex={currentStepIndex}
            setCurrentStepIndex={setCurrentStepIndex}
          />

          <div className="mt-4 overflow-hidden rounded-[24px] border border-blue-100 bg-white">
            <div className="relative min-h-[230px] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
              {currentStep.imageSrc ? (
                <img
                  src={currentStep.imageSrc}
                  alt={currentStep.visualTitle}
                  className="h-full min-h-[230px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[230px] flex-col items-center justify-center p-7 text-center">
                  <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-electric-600 text-white shadow-blue">
                    <VisualIcon className="h-12 w-12" />
                  </div>
                  <p className="mt-4 text-2xl font-black text-navy-950">{currentStep.visualTitle}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{currentStep.visualSubtitle}</p>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-[26px] font-black leading-tight text-navy-950">{currentStep.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-slate-600">{currentStep.body}</p>
              <div className="mt-4 space-y-2.5">
                {currentStep.bullets.slice(0, 3).map((bullet) => (
                  <div key={bullet} className="flex gap-2.5 text-[15px] font-semibold text-navy-950">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-electric-600 text-white">
                      <Check className="h-4 w-4" />
                    </span>
                    {bullet}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-[15px] font-semibold leading-6 text-navy-950">
                <CalloutIcon className="mt-0.5 h-5 w-5 shrink-0 text-electric-700" />
                {currentStep.callout}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button className="h-12 rounded-2xl text-sm font-black" onClick={onContinue}>
                  {currentStepIndex >= totalSteps - 1 ? "Start Day 1" : "Continue Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl border-blue-200 text-sm font-black text-electric-700" onClick={onComplete}>
                  Skip to Day 1
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-3">
          {infoCards.map(({ Icon, title, items }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-electric-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-black leading-5 text-navy-950">{title}</h3>
              <div className="mt-3 space-y-2">
                {items.slice(0, 3).map((item) => (
                  <div key={item} className="flex gap-1.5 text-[12px] font-semibold leading-4 text-slate-600">
                    <Check className="h-3.5 w-3.5 shrink-0 text-electric-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_40px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="text-lg font-black text-navy-950">Step {currentNumber}/{totalSteps}</div>
          <Button className="h-14 min-w-[164px] rounded-2xl text-lg font-black" onClick={onContinue}>
            Continue
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileProgressCard({
  percent,
  currentNumber,
  totalSteps,
}: {
  percent: number;
  currentNumber: number;
  totalSteps: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
      <h2 className="text-sm font-black text-navy-950">Setup Progress</h2>
      <div className="mt-4 flex items-center gap-3">
        <div
          className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(#0f62fe ${percent * 3.6}deg, #dbeafe 0deg)` }}
        >
          <div className="grid h-[66px] w-[66px] place-items-center rounded-full bg-white text-2xl font-black text-navy-950">
            {percent}%
          </div>
        </div>
        <div className="text-sm">
          <p className="text-lg font-black text-navy-950">{currentNumber} of {totalSteps}</p>
          <p className="font-black text-navy-950">steps done</p>
          <p className="mt-2 text-slate-600">Keep going!</p>
        </div>
      </div>
    </div>
  );
}

function MobileSetupStepper({
  steps,
  currentStepIndex,
  setCurrentStepIndex,
}: {
  steps: TrainingOnboardingStep[];
  currentStepIndex: number;
  setCurrentStepIndex: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="mt-5 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = index < currentStepIndex;
        const isActive = index === currentStepIndex;
        const canNavigate = index <= currentStepIndex;
        return (
          <div key={step.id} className="relative text-center">
            {index > 0 && <div className="absolute right-1/2 top-5 h-px w-full bg-slate-300" />}
            <button
              type="button"
              disabled={!canNavigate}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Go to onboarding step ${stepNumber}: ${step.label}`}
              onClick={() => {
                if (canNavigate) {
                  setCurrentStepIndex(index);
                }
              }}
              className={cn(
                "relative z-10 mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-black",
                isComplete && "bg-emerald-500 text-white",
                isActive && "bg-electric-600 text-white",
                !isComplete && !isActive && "bg-slate-200 text-slate-800",
              )}
            >
              {isComplete ? <Check className="h-5 w-5" /> : stepNumber}
            </button>
            <p className={cn("mt-2 text-[12px] font-black leading-4", isActive ? "text-electric-700" : "text-navy-950")}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MobileSetupMenu({
  open,
  productType,
  onClose,
  onComplete,
}: {
  open: boolean;
  productType: VoiceFlexProduct;
  onClose: () => void;
  onComplete: () => void;
}) {
  const trainingBase = `/train/${productType}`;
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button type="button" aria-label="Close menu overlay" className="absolute inset-0 bg-navy-950/40" onClick={onClose} />
      <div className="absolute right-4 top-4 w-[min(320px,calc(100vw-32px))] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-navy-950">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-electric-600 text-cyan-100">
              <Waves className="h-6 w-6" />
            </span>
            Voice Flex
          </div>
          <button type="button" aria-label="Close menu" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-navy-950">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-5 space-y-2 text-base font-black">
          <a href={trainingBase} className="block rounded-2xl bg-electric-600 px-4 py-3 text-white" onClick={onClose}>
            🚀 Setup
          </a>
          <button
            type="button"
            className="block w-full rounded-2xl px-4 py-3 text-left text-slate-700"
            onClick={() => {
              onClose();
              onComplete();
            }}
          >
            🎙️ Sessions
          </button>
          <a href={`${trainingBase}/progress`} className="block rounded-2xl px-4 py-3 text-slate-700" onClick={onClose}>
            📊 Progress
          </a>
          <a href="/settings" className="block rounded-2xl px-4 py-3 text-slate-700" onClick={onClose}>
            ⚙️ Settings
          </a>
        </nav>
      </div>
    </div>
  );
}
