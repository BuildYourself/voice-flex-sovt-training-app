"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { onboardingCalloutIcon, onboardingVisualIcons, trainingOnboardingConfigs } from "@/lib/training-onboarding";
import type { LocalTrainingProgress } from "@/lib/training-progress";
import type { VoiceFlexProduct } from "@/lib/training-product";

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

  const continueSetup = () => {
    if (currentStepIndex >= totalSteps - 1) {
      onComplete();
      return;
    }
    setCurrentStepIndex((step) => Math.min(totalSteps - 1, step + 1));
  };

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-navy-950">
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
  );
}
