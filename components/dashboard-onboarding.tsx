"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BookOpen, CalendarCheck, Check, CheckCircle2, Droplet, Flag, FlaskConical, Info, Leaf, Play, Rocket, Settings2, ShieldCheck, Sparkles, Star, Timer, Trophy, Volume2, Waves, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const setupSteps = [
  { number: 1, title: "Welcome", label: "Welcome" },
  { number: 2, title: "What is SOVT?", label: "What is SOVT?" },
  { number: 3, title: "Set up your Voice Flex GO", label: "Set up your Voice Flex GO" },
  { number: 4, title: "Adjust resistance", label: "Adjust resistance" },
  { number: 5, title: "Practice safely", label: "Practice safely" },
  { number: 6, title: "Start Day 1", label: "Start Day 1" }
];

const learnItems = [
  "Understand SOVT and how it helps your voice",
  "Set up your Voice Flex GO bottle correctly",
  "Adjust resistance for your comfort and goals",
  "Practice safely with smart, effective habits",
  "Start your first session with confidence"
];

const whyItems = [
  { icon: FlaskConical, title: "Science-backed", text: "Built on SOVT research to support healthy vocal function and reduce vocal strain.", color: "bg-blue-50 text-electric-700" },
  { icon: Sparkles, title: "Simple and effective", text: "Short, focused sessions that fit into your day and deliver real results.", color: "bg-emerald-50 text-emerald-600" },
  { icon: Trophy, title: "Progress you can feel", text: "Track your journey and build strength, endurance, and confidence over time.", color: "bg-purple-50 text-purple-600" }
];

const journey = [
  { icon: Rocket, title: "Get started", label: "Day 1", active: true },
  { icon: Leaf, title: "Build the basics", label: "Days 2-7", active: false },
  { icon: Waves, title: "Find your flow", label: "Days 8-14", active: false },
  { icon: ShieldCheck, title: "Build strength", label: "Days 15-21", active: false },
  { icon: Star, title: "Your best voice", label: "Ongoing", active: false }
];

type OnboardingHeader = {
  title: string;
  subtitle: string;
};

const onboardingHeaders: Record<number, OnboardingHeader> = {
  1: {
    title: "Let's set up your Voice Flex GO",
    subtitle: "We'll walk you through everything you need to know so you can use Voice Flex correctly and confidently before starting Day 1."
  },
  2: {
    title: "Let's set up your Voice Flex GO",
    subtitle: "This quick setup will teach you how to use Voice Flex correctly so you can start Day 1 with confidence and get the best results."
  },
  3: {
    title: "Let's set up your Voice Flex GO",
    subtitle: "This quick setup will show you how to prepare the bottle and straw correctly before your first session."
  },
  4: {
    title: "Let's set up your Voice Flex tools",
    subtitle: "This quick setup helps you find the right resistance before your first session."
  },
  5: {
    title: "Practice safely",
    subtitle: "A few simple safety guidelines to help you get the most out of your practice."
  },
  6: {
    title: "🎉 Start Day 1",
    subtitle: "Great job! You're ready to begin your voice training journey."
  }
};

export function DashboardOnboarding({ onHeaderChange }: { onHeaderChange?: (header: OnboardingHeader) => void }) {
  const [currentSetupStep, setCurrentSetupStep] = useState(1);
  const isStepTwo = currentSetupStep === 2;
  const isStepThree = currentSetupStep === 3;
  const isStepFour = currentSetupStep === 4;
  const isStepFive = currentSetupStep === 5;
  const isStepSix = currentSetupStep === 6;
  const currentStepTitle = setupSteps.find((step) => step.number === currentSetupStep)?.title ?? "Welcome";
  const setSetupStep = (step: number) => {
    setCurrentSetupStep(step);
    onHeaderChange?.(onboardingHeaders[step] ?? onboardingHeaders[1]);
  };

  useEffect(() => {
    const header = onboardingHeaders[currentSetupStep] ?? onboardingHeaders[1];
    onHeaderChange?.(header);

    if (!onHeaderChange) {
      const title = document.querySelector("main header h1");
      const subtitle = document.querySelector("main header p");
      if (title) title.textContent = header.title;
      if (subtitle) subtitle.textContent = header.subtitle;
    }
  }, [currentSetupStep, onHeaderChange]);
  const continueFromStepTwo = () => {
    setSetupStep(3);
  };
  const continueFromStepThree = () => {
    setSetupStep(4);
  };
  const continueFromStepFour = () => {
    setSetupStep(5);
  };
  const continueFromStepFive = () => {
    setSetupStep(6);
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black tracking-normal text-navy-950">
                  <span className="text-electric-700">Step {currentSetupStep} of 6</span> - {currentStepTitle}
                </h2>
              </div>

              <SetupTimeline currentStep={currentSetupStep} />

              <div className="border-t border-slate-200 pt-6">
                {isStepSix ? (
                  <StepSixContent onBack={() => setSetupStep(5)} />
                ) : isStepFive ? (
                  <StepFiveContent onBack={() => setSetupStep(4)} onContinue={continueFromStepFive} />
                ) : isStepFour ? (
                  <StepFourContent onContinue={continueFromStepFour} />
                ) : isStepThree ? (
                  <StepThreeContent onContinue={continueFromStepThree} />
                ) : isStepTwo ? (
                  <StepTwoContent onContinue={continueFromStepTwo} />
                ) : (
                  <StepOneContent onContinue={() => setSetupStep(2)} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!isStepFive && !isStepSix && (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,.9fr)_minmax(0,.9fr)_minmax(0,1.55fr)]">
            {isStepFour ? (
            <>
              <VoiceFlexGoCard />
              <VoiceFlexProCard />
              <StepFourNextCard />
            </>
            ) : isStepThree ? (
            <>
              <NeedCard />
              <StepThreeGoodSignsCard />
              <WhatHappensNextCard />
            </>
            ) : isStepTwo ? (
            <>
              <NoticeCard />
              <GoodSignsCard />
              <JourneyCard />
            </>
            ) : (
            <>
              <InfoListCard />
              <WhyVoiceFlexCard />
              <JourneyCard />
            </>
            )}
          </div>
        )}
      </div>

      <div className="2xl:content-start">
        <SetupStatCard currentStep={currentSetupStep} />
      </div>
    </div>
  );
}

function SetupTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      {setupSteps.map((step) => {
        const active = step.number === currentStep;
        const complete = step.number < currentStep;
        const label = currentStep >= 4 && step.number === 3 ? "Set up your product" : step.label;
        return (
          <div key={step.number} className="relative flex flex-col items-center gap-3 text-center">
            {step.number < setupSteps.length && (
              <span className={cn("absolute left-[55%] top-5 hidden w-[90%] border-t sm:block", complete ? "border-electric-600" : "border-dashed border-slate-300")} />
            )}
            <span
              className={cn(
                "relative z-10 grid h-10 w-10 place-items-center rounded-full text-base font-black",
                active && "bg-electric-600 text-white shadow-lg shadow-blue-200",
                complete && "bg-emerald-500 text-white",
                !active && !complete && "bg-slate-200 text-slate-600"
              )}
            >
              {complete ? <Check className="h-6 w-6" /> : step.number}
            </span>
            <p className={cn("text-sm font-black leading-tight", active ? "text-electric-700" : complete ? "text-navy-950" : "text-slate-600")}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}

function StepOneContent({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,.8fr)]">
      <FakeVideoCard />

      <div className="flex flex-col justify-center">
        <h3 className="text-2xl font-black text-navy-950">Welcome to Voice Flex</h3>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Voice Flex combines the science of SOVT (Semi-Occluded Vocal Tract) with simple, effective training to help you build a stronger, more confident voice.
        </p>
        <p className="mt-5 text-base leading-7 text-slate-600">
          In this quick setup, you&apos;ll learn how Voice Flex works and how to get the most from every session.
        </p>
        <SetupButtons onContinue={onContinue} />
      </div>
    </div>
  );
}

function StepTwoContent({ onContinue }: { onContinue: () => void }) {
  const bullets = [
    "SOVT stands for Semi-Occluded Vocal Tract",
    "It creates gentle back pressure",
    "It helps your voice feel easier, steadier, and less strained",
    "It should feel relaxed, never forced"
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,.8fr)]">
      <SovtVideoCard />

      <div className="flex flex-col justify-center">
        <h3 className="text-2xl font-black text-navy-950">What is SOVT?</h3>
        <ul className="mt-5 space-y-4">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base leading-6 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-electric-600 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-4 rounded-xl bg-blue-50 px-5 py-4 text-base font-bold leading-6 text-navy-950">
          <Info className="mt-0.5 h-6 w-6 shrink-0 text-electric-600" />
          <p>In simple terms: the straw helps your voice work with less effort.</p>
        </div>
        <SetupButtons onContinue={onContinue} />
      </div>
    </div>
  );
}

function StepThreeContent({ onContinue }: { onContinue: () => void }) {
  const instructions = [
    "Fill the bottle to about 40% with water",
    "Insert the straw and keep the tip 1-2 cm above the bottom",
    "Sit tall and relax your shoulders",
    "Keep everything gentle and comfortable"
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(290px,.8fr)]">
      <SetupVisualCard />

      <div className="flex flex-col justify-center">
        <h3 className="text-2xl font-black text-navy-950">Set up your Voice Flex GO</h3>
        <ol className="mt-5 space-y-4">
          {instructions.map((item, index) => (
            <li key={item} className="flex items-start gap-3 text-base leading-6 text-slate-700">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-electric-600 text-white" />
              <span>
                <b className="mr-2 text-navy-950">{index + 1}.</b>
                {item}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex gap-4 rounded-xl bg-blue-50 px-5 py-4 text-base font-bold leading-6 text-navy-950">
          <Info className="mt-0.5 h-6 w-6 shrink-0 text-electric-600" />
          <p>Tip: Your setup should feel easy and stable before you start bubbling.</p>
        </div>
        <SetupButtons onContinue={onContinue} />
      </div>
    </div>
  );
}

function StepFourContent({ onContinue }: { onContinue: () => void }) {
  const goInstructions = [
    "Start on low resistance",
    "If it feels too easy, move the slider up",
    "If it feels too hard, move the slider down",
    "Aim for gentle, steady airflow - never force it"
  ];
  const strawOptions = [
    { title: "Bamboo", label: "easy start", image: "/assets/onboarding/straw-bamboo.png", selected: true },
    { title: "Silicone", label: "soft feel", image: "/assets/onboarding/straw-silicone-blue.png", selected: false },
    { title: "Metal 6 mm", label: "medium resistance", image: "/assets/onboarding/straw-metal-6mm.png", selected: false },
    { title: "Metal 3 mm", label: "higher resistance", image: "/assets/onboarding/straw-metal-3mm.png", selected: false }
  ];

  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-[1.04fr_.96fr]">
        <div className="relative min-h-[410px] overflow-hidden rounded-2xl border-2 border-electric-500 bg-gradient-to-br from-white via-blue-50/70 to-white p-4 sm:p-5">
          <span className="absolute left-3 top-3 rounded-full bg-electric-600 px-3 py-1 text-sm font-black text-white shadow-sm">Active</span>
          <div className="mb-4 flex items-center gap-3 pl-20">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-electric-600 text-lg font-black text-white">A</span>
            <h3 className="text-[22px] font-black leading-tight text-navy-950">Voice Flex GO - Adjust resistance</h3>
          </div>
          <div className="grid min-h-[330px] gap-5 lg:grid-cols-[245px_minmax(0,1fr)] xl:grid-cols-[255px_minmax(0,1fr)]">
            <div className="relative flex items-end justify-center">
              <img
                src="/assets/onboarding/voice-flex-go-resistance.png"
                alt="Voice Flex GO blue resistance tool"
                className="h-[335px] w-auto object-contain drop-shadow-xl sm:h-[360px]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)]">
              <div className="flex items-end">
                <div className="w-full rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-sm font-bold text-slate-600">Resistance guide</p>
                  {["Low", "Medium", "High"].map((level, index) => (
                    <div key={level} className="mt-3 flex items-center gap-3">
                      <span className={cn("h-3 w-3 rounded-full", index === 2 ? "border-2 border-electric-600 bg-white" : "bg-blue-400")} />
                      <span className="w-16 text-sm text-slate-600">{level}</span>
                      <span className="h-1.5 flex-1 rounded-full bg-slate-200">
                        <span className={cn("block h-full rounded-full bg-electric-600", index === 0 && "w-1/3", index === 1 && "w-2/3", index === 2 && "w-full")} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <ol className="space-y-5">
                  {goInstructions.map((item, index) => (
                    <li key={item} className="flex items-start gap-4 text-base leading-6 text-slate-700">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-electric-600 text-sm font-black text-white">{index + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-auto flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-5 text-navy-950">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-electric-600" />
                  <p>Tip: You should feel easy, controlled resistance - not throat tension.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[410px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-600 text-lg font-black text-white">B</span>
            <h3 className="text-[22px] font-black leading-tight text-navy-950">Voice Flex PRO - Choose the right straw</h3>
          </div>
          <p className="max-w-[520px] text-base leading-6 text-slate-600">Start easier, then move to narrower straws as control improves.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {strawOptions.map((straw) => (
              <div key={straw.title} className={cn("flex min-h-[250px] flex-col items-center rounded-xl border bg-white px-3 py-4 text-center", straw.selected ? "border-electric-300 shadow-sm" : "border-slate-200")}>
                <div className="flex h-28 items-center justify-center">
                  <img src={straw.image} alt={`${straw.title} straw`} className="h-28 w-auto object-contain" />
                </div>
                <h4 className="mt-4 text-base font-black text-navy-950">{straw.title}</h4>
                <p className="mt-1 min-h-[38px] text-sm leading-5 text-slate-600">{straw.label}</p>
                <span className={cn("mt-auto grid h-6 w-6 place-items-center rounded-full border-2", straw.selected ? "border-electric-600" : "border-slate-400")}>
                  {straw.selected && <span className="h-3 w-3 rounded-full bg-electric-600" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 grid max-w-[790px] gap-4 sm:grid-cols-2">
        <Button className="h-14 bg-electric-600 text-base font-black hover:bg-electric-700" onClick={onContinue}>
          Continue Setup
          <span className="ml-2">-&gt;</span>
        </Button>
        <Button asChild variant="outline" className="h-14 border-electric-300 text-base font-black text-electric-700 hover:bg-blue-50">
          <Link href="/session">Skip to Day 1 <span className="ml-2">-&gt;</span></Link>
        </Button>
      </div>
    </div>
  );
}

function StepFiveContent({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const safetyTips = [
    {
      icon: Waves,
      title: "Use relaxed breath",
      text: "Inhale gently through your nose and exhale through the device."
    },
    {
      icon: Volume2,
      title: "Keep it comfortable",
      text: "You should feel gentle resistance, not strain. Back off if it feels like too much."
    },
    {
      icon: Timer,
      title: "Short & consistent",
      text: "Start with just a few minutes. Consistency is more important than duration."
    },
    {
      icon: Droplet,
      title: "Stay hydrated",
      text: "Drink water before and after practice to keep your voice in top shape."
    },
    {
      icon: AlertTriangle,
      title: "Stop if it hurts",
      text: "Discomfort is your body's signal. Rest and try again later."
    }
  ];
  const goodPractice = [
    "Easy, steady airflow",
    "Light vibration or buzz",
    "Relaxed throat and jaw",
    "You can speak comfortably after practice"
  ];
  const tooMuch = [
    "Hard to breathe",
    "Throat or neck strain",
    "Dizziness or lightheadedness",
    "Hoarse or tired voice after practice"
  ];

  return (
    <div>
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/45 via-white to-purple-50/35 p-6 sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,.95fr)_1px_minmax(0,1.15fr)]">
          <div>
            <h3 className="max-w-[430px] text-2xl font-black leading-snug text-navy-950">
              Follow these tips for effective and safe practice
            </h3>
            <div className="mt-7 space-y-6">
              {safetyTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className="flex gap-5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-purple-100 text-purple-600">
                      <Icon className="h-7 w-7" />
                    </span>
                    <div>
                      <h4 className="text-base font-black text-navy-950">{tip.title}</h4>
                      <p className="mt-1 max-w-[430px] text-base leading-6 text-slate-600">{tip.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden w-px bg-slate-200 xl:block" />

          <div>
            <h3 className="text-2xl font-black text-navy-950">How it should feel</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/75 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  <h4 className="text-xl font-black text-emerald-700">Good practice</h4>
                </div>
                <ul className="mt-5 space-y-3">
                  {goodPractice.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-6 text-slate-700">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex justify-center">
                  <div className="relative h-32 w-40">
                    <div className="absolute bottom-4 left-3 h-16 w-20 rounded-full border-4 border-emerald-500 border-l-0 border-t-0" />
                    <Waves className="absolute bottom-10 left-0 h-12 w-12 text-emerald-500" />
                    <span className="absolute bottom-0 left-0 h-5 w-5 rounded-full bg-emerald-500" />
                    <span className="absolute bottom-1 right-4 h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
                    <span className="absolute bottom-2 left-4 right-6 h-1.5 rounded-full bg-emerald-300" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50/80 p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <h4 className="text-xl font-black text-red-600">Too much</h4>
                </div>
                <ul className="mt-5 space-y-3">
                  {tooMuch.map((item) => (
                    <li key={item} className="flex gap-3 text-base leading-6 text-slate-700">
                      <span className="mt-1 text-red-500">x</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex justify-center">
                  <div className="relative h-32 w-40">
                    <div className="absolute bottom-4 left-8 h-16 w-20 rounded-full border-4 border-red-500 border-l-0 border-t-0" />
                    <AlertTriangle className="absolute bottom-12 right-3 h-10 w-10 text-red-500" />
                    <span className="absolute bottom-0 left-0 h-5 w-5 rounded-full bg-red-500" />
                    <span className="absolute bottom-1 right-4 h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
                    <span className="absolute bottom-2 left-4 right-6 h-1.5 rounded-full bg-red-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-4 rounded-xl border border-electric-200 bg-blue-50 px-5 py-4 text-base leading-6 text-slate-700">
              <Info className="mt-0.5 h-6 w-6 shrink-0 text-electric-600" />
              <p><b>Remember:</b> Gentle, steady, and consistent is the key. Your voice tells you when you&apos;re doing it right.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" className="h-14 min-w-[150px] border-electric-300 text-base font-black text-electric-700 hover:bg-blue-50" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button className="h-14 min-w-[300px] bg-electric-600 text-base font-black hover:bg-electric-700" onClick={onContinue}>
          Continue to Day 1
          <span className="ml-2">-&gt;</span>
        </Button>
      </div>
    </div>
  );
}

function StepSixContent({ onBack }: { onBack: () => void }) {
  const dayPlan = [
    {
      icon: Waves,
      title: "Warm-up",
      time: "2-3 minutes",
      text: "Gentle airflow to wake up your voice."
    },
    {
      icon: Volume2,
      title: "Straw Practice",
      time: "5-7 minutes",
      text: "Steady, controlled phonation."
    },
    {
      icon: Trophy,
      title: "Voice Flex GO Practice",
      time: "5-7 minutes",
      text: "Build strength and control."
    }
  ];

  return (
    <div>
      <div className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/45 p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <CheckCircle2 className="h-12 w-12 shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-3xl font-black leading-tight text-navy-950">You&apos;re all set!</h3>
              <p className="mt-5 max-w-[430px] text-lg font-bold leading-7 text-navy-950">
                You&apos;ve completed all the setup steps.<br />
                Let&apos;s begin your first session.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex h-56 items-end justify-center">
                <img
                  src="/assets/onboarding/voice-flex-go-resistance.png"
                  alt="Voice Flex GO portable tool"
                  className="h-52 w-auto object-contain drop-shadow-xl"
                />
              </div>
              <h4 className="mt-4 text-lg font-black text-navy-950">Voice Flex GO (portable)</h4>
              <p className="mt-2 text-base text-slate-600">Ready to use.</p>
            </div>

            <div>
              <div className="flex h-56 items-end justify-center gap-4">
                <img src="/assets/onboarding/straw-metal-6mm.png" alt="Voice Flex PRO metal straw" className="h-48 w-auto object-contain drop-shadow-lg" />
                <img src="/assets/onboarding/straw-bamboo.png" alt="Voice Flex PRO bamboo straw" className="h-44 w-auto object-contain drop-shadow-lg" />
                <img src="/assets/onboarding/straw-metal-3mm.png" alt="Voice Flex PRO 3 mm straw" className="h-48 w-auto object-contain drop-shadow-lg" />
                <img src="/assets/onboarding/straw-silicone-blue.png" alt="Voice Flex PRO silicone straw" className="h-44 w-auto object-contain drop-shadow-lg" />
              </div>
              <h4 className="mt-4 text-lg font-black text-navy-950">Voice Flex PRO</h4>
              <p className="mt-2 text-base text-slate-600">Choose your straw and you&apos;re ready.</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-base leading-6 text-slate-700">
            <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <p><b>Tip:</b> Consistency is key. Even a few minutes every day can make a big difference.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h3 className="text-3xl font-black leading-tight text-navy-950">Your Day 1 plan</h3>
          <p className="mt-4 text-lg leading-7 text-slate-600">A short and effective first session to get you started.</p>

          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/45 p-5">
            <div className="space-y-6">
              {dayPlan.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-100 text-electric-600">
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="text-lg font-black text-navy-950">{index + 1}. {item.title}</h4>
                        <span className="text-sm font-black text-electric-700">{item.time}</span>
                      </div>
                      <p className="mt-2 text-base leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex gap-4 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
            <Star className="mt-0.5 h-7 w-7 shrink-0 text-amber-500" />
            <div>
              <h4 className="text-lg font-black text-navy-950">Remember</h4>
              <p className="mt-2 text-base leading-6 text-slate-700">Focus on steady airflow and how it feels, not how it sounds.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" className="h-14 min-w-[150px] border-electric-300 text-base font-black text-electric-700 hover:bg-blue-50" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button asChild className="h-14 min-w-[240px] bg-electric-600 text-base font-black hover:bg-electric-700">
          <Link href="/session">
            Start Day 1
            <span className="ml-2">-&gt;</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SetupButtons({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mt-7 space-y-3">
      <Button className="h-12 w-full bg-electric-600 font-black hover:bg-electric-700" onClick={onContinue}>
        Continue Setup
        <span className="ml-2">-&gt;</span>
      </Button>
      <Button asChild variant="outline" className="h-12 w-full border-electric-300 font-black text-electric-700 hover:bg-blue-50">
        <Link href="/session">Skip to Day 1</Link>
      </Button>
    </div>
  );
}

function SetupVisualCard() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-blue-100 bg-[radial-gradient(circle_at_74%_20%,rgba(255,255,255,.92),transparent_30%),linear-gradient(135deg,#eaf5ff_0%,#dfefff_56%,#f8fbff_100%)] shadow-inner">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute bottom-12 left-0 right-0 h-32 bg-[repeating-linear-gradient(166deg,transparent_0,transparent_18px,rgba(255,255,255,.68)_19px,transparent_20px)]" />
      </div>

      <div className="absolute left-10 top-24 text-sm font-black leading-5 text-electric-700">
        <p>Fill to</p>
        <p>about 40%</p>
        <span className="mt-2 block h-px w-24 bg-electric-500" />
      </div>
      <div className="absolute bottom-20 left-10 text-sm font-black leading-5 text-electric-700">
        <p>1-2 cm</p>
        <p>above the</p>
        <p>bottom</p>
        <span className="mt-2 block h-14 w-px bg-electric-500" />
      </div>

      <div className="absolute bottom-10 left-[31%] h-72 w-28 -translate-x-1/2">
        <div className="absolute left-1/2 top-0 h-24 w-9 -translate-x-1/2 rounded-full border-4 border-amber-300 bg-amber-100/80" />
        <div className="absolute left-1/2 top-12 h-40 w-6 -translate-x-1/2 rotate-[-4deg] rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg" />
        <div className="absolute bottom-0 h-44 w-full overflow-hidden rounded-b-3xl rounded-t-xl border border-slate-300 bg-white/75 shadow-xl backdrop-blur">
          <div className="absolute bottom-0 left-0 right-0 h-[58%] bg-blue-200/70">
            <div className="absolute -top-2 left-2 right-2 h-4 rounded-full border border-blue-300 bg-blue-100/75" />
            <div className="absolute bottom-6 left-7 h-2 w-2 rounded-full bg-blue-400/70" />
            <div className="absolute bottom-14 right-8 h-3 w-3 rounded-full bg-blue-300/70" />
            <div className="absolute bottom-20 left-12 h-2 w-2 rounded-full bg-blue-300/70" />
          </div>
        </div>
        <div className="absolute bottom-40 left-1/2 h-24 w-24 -translate-x-1/2 rounded-2xl bg-navy-950 shadow-xl">
          <Waves className="absolute left-1/2 top-8 h-7 w-7 -translate-x-1/2 text-white" />
          <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] font-black uppercase leading-3 text-white">
            Voice<br />Flex<br /><span className="text-cyan-300">GO</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 right-[10%] h-72 w-48">
        <div className="absolute left-20 top-6 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_42%_35%,#fed7aa,#fb923c)] shadow-lg" />
        <div className="absolute left-12 top-2 h-12 w-28 rounded-full bg-slate-900" />
        <div className="absolute left-20 top-28 h-36 w-28 rounded-t-[40px] bg-navy-800 shadow-xl" />
        <div className="absolute left-5 top-36 h-24 w-10 rotate-[-12deg] rounded-full bg-orange-200" />
        <div className="absolute right-0 top-36 h-24 w-10 rotate-[12deg] rounded-full bg-orange-200" />
        <div className="absolute bottom-0 left-10 h-24 w-12 rounded-b-3xl bg-navy-900" />
        <div className="absolute bottom-0 right-8 h-24 w-12 rounded-b-3xl bg-navy-900" />
        <div className="absolute bottom-3 left-0 right-2 h-10 rounded-xl bg-slate-300" />
      </div>
    </div>
  );
}

function FakeVideoCard() {
  return (
    <div className="relative min-h-[310px] overflow-hidden rounded-2xl border border-blue-100 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,.95),rgba(219,234,254,.78)_34%,rgba(147,197,253,.55)_75%)] shadow-inner">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute bottom-10 left-0 right-0 h-28 bg-[repeating-linear-gradient(170deg,transparent_0,transparent_16px,rgba(255,255,255,.46)_17px,transparent_18px)]" />
      </div>
      <div className="absolute left-[21%] top-[21%] h-44 w-24 rotate-[-12deg] rounded-[28px] bg-gradient-to-br from-blue-300 to-electric-700 shadow-2xl">
        <div className="absolute inset-x-6 top-6 h-8 rounded-full bg-white/35" />
        <Waves className="absolute bottom-12 left-1/2 h-9 w-9 -translate-x-1/2 text-cyan-200" />
      </div>
      <button className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[6px] border-white bg-electric-600 text-white shadow-2xl" aria-label="Play welcome video">
        <Play className="ml-1 h-9 w-9 fill-current" />
      </button>
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
        <span className="flex h-10 items-center gap-2 rounded-xl bg-navy-950/70 px-4 text-sm font-black text-white backdrop-blur">
          <Timer className="h-5 w-5" /> 40 sec
        </span>
        <div className="h-2 flex-1 rounded-full bg-white/35">
          <div className="h-full w-[12%] rounded-full bg-electric-600" />
        </div>
        <Waves className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

function SovtVideoCard() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_20%_45%,rgba(56,189,248,.42),transparent_32%),linear-gradient(135deg,#021b3d_0%,#063d87_48%,#061632_100%)] shadow-inner">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-12 top-20 h-40 w-40 rounded-full border border-cyan-300/40" />
        <div className="absolute left-24 top-28 h-28 w-28 rounded-full border border-cyan-200/30" />
        <div className="absolute bottom-20 left-20 h-20 w-48 rounded-full border border-cyan-300/20" />
      </div>
      <div className="absolute left-8 top-12 h-52 w-40 rounded-full border-l-[18px] border-cyan-200/60" />
      <div className="absolute left-24 top-36 h-4 w-80 rounded-full bg-cyan-100/70 shadow-[0_0_35px_rgba(125,211,252,.7)]" />
      <div className="absolute bottom-20 right-16 h-28 w-36 rounded-b-3xl rounded-t-xl border border-cyan-200/50 bg-cyan-300/15">
        <div className="absolute inset-x-4 top-10 h-1 rounded-full bg-cyan-100/50" />
        <div className="absolute bottom-5 left-10 h-3 w-3 rounded-full bg-cyan-200/60" />
        <div className="absolute bottom-9 left-16 h-2 w-2 rounded-full bg-cyan-200/60" />
      </div>
      <div className="absolute right-16 top-16 text-right text-white">
        <p className="text-5xl font-black tracking-normal">SOVT</p>
        <p className="mt-2 max-w-[210px] text-xl leading-7 text-blue-100">Semi-Occluded Vocal Tract</p>
      </div>
      <button className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-electric-600 text-white shadow-2xl" aria-label="Play SOVT explainer">
        <Play className="ml-1 h-9 w-9 fill-current" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-black/35 px-5 py-4 text-white backdrop-blur">
        <Play className="h-5 w-5 fill-current" />
        <span className="font-semibold">0:00 / 0:45</span>
        <div className="h-2 flex-1 rounded-full bg-white/25">
          <div className="h-full w-[7%] rounded-full bg-electric-500" />
        </div>
        <Waves className="h-6 w-6" />
      </div>
    </div>
  );
}

function InfoListCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-electric-600" />
          <h3 className="text-xl font-black text-navy-950">What you&apos;ll learn</h3>
        </div>
        <ul className="mt-6 space-y-4">
          {learnItems.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-600">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-electric-600 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function WhyVoiceFlexCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-electric-600" />
          <h3 className="text-xl font-black text-navy-950">Why Voice Flex works</h3>
        </div>
        <div className="mt-5 space-y-4">
          {whyItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4">
                <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", item.color)}>
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <h4 className="font-black text-navy-950">{item.title}</h4>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function NoticeCard() {
  const items = ["Easier airflow", "Steadier tone", "Less throat tension", "Smoother warm-up"];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-electric-600" />
          <h3 className="text-xl font-black text-navy-950">What you&apos;ll notice</h3>
        </div>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-600">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-electric-600 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function GoodSignsCard() {
  const items = ["Gentle bubbles", "Relaxed shoulders and jaw", "Easy comfortable sound", "No pushing or strain"];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          <h3 className="text-xl font-black text-navy-950">Good signs</h3>
        </div>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-600">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-emerald-500 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function NeedCard() {
  const items = [
    { icon: Droplet, title: "Water", text: "Clean, room temperature water", color: "bg-blue-50 text-electric-600" },
    { icon: Waves, title: "Voice Flex GO bottle", text: "Your SOVT training tool", color: "bg-slate-100 text-navy-800" },
    { icon: Sparkles, title: "Yellow straw", text: "Pre-installed or provided", color: "bg-amber-50 text-amber-500" }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-electric-600" />
          <h3 className="text-xl font-black text-navy-950">What you&apos;ll need</h3>
        </div>
        <div className="mt-5 space-y-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-4">
                <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", item.color)}>
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="font-black text-navy-950">{item.title}</h4>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function StepThreeGoodSignsCard() {
  const items = ["Relaxed shoulders", "Easy setup", "Stable water level"];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          <h3 className="text-xl font-black text-navy-950">Good signs</h3>
        </div>
        <ul className="mt-6 space-y-5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-600">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-emerald-500 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function WhatHappensNextCard() {
  const items = [
    { icon: Settings2, kicker: "Next up", title: "Adjust resistance", text: "Find your right level", color: "bg-blue-50 text-electric-600" },
    { icon: ShieldCheck, kicker: "Then", title: "Practice safely", text: "Build good habits", color: "bg-purple-50 text-purple-600" },
    { icon: CalendarCheck, kicker: "Finally", title: "Start Day 1", text: "Your first session", color: "bg-amber-50 text-amber-500" }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Flag className="h-7 w-7 text-purple-600" />
          <h3 className="text-xl font-black text-navy-950">What happens next</h3>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative flex flex-col items-center text-center">
                {index < items.length - 1 && <span className="absolute left-[62%] top-8 hidden w-[76%] border-t border-dashed border-slate-300 sm:block" />}
                <span className={cn("relative z-10 grid h-16 w-16 place-items-center rounded-full text-2xl", item.color)}>
                  <Icon className="h-8 w-8" />
                </span>
                <p className="mt-4 text-sm font-black text-electric-700">{item.kicker}</p>
                <h4 className="mt-1 text-sm font-black text-navy-950">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function VoiceFlexGoCard() {
  const items = [
    "Use the slider to adjust airflow resistance",
    "Start on low and make small adjustments",
    "Find a setting that feels easy and steady",
    "Keep airflow smooth and relaxed"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-electric-600 text-base font-black text-white">A</span>
          <h3 className="text-xl font-black text-navy-950">Voice Flex GO</h3>
        </div>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-600">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-electric-600 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function VoiceFlexProCard() {
  const items = [
    "Pick a straw that matches your comfort",
    "Start with easier options first",
    "Move to narrower straws as you improve",
    "Focus on gentle, steady airflow"
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-600 text-base font-black text-white">B</span>
          <h3 className="text-xl font-black text-navy-950">Voice Flex PRO</h3>
        </div>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base text-slate-600">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 fill-slate-500 text-white" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function StepFourNextCard() {
  const items = [
    { icon: ShieldCheck, title: "Practice safely", text: "Build good habits", color: "bg-purple-50 text-purple-600" },
    { icon: Waves, title: "Prepare for Day 1", text: "Get ready", color: "bg-blue-50 text-electric-600" },
    { icon: CalendarCheck, title: "Start Day 1", text: "Your first session", color: "bg-amber-50 text-amber-500" }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Flag className="h-7 w-7 text-purple-600" />
          <h3 className="text-xl font-black text-navy-950">What happens next</h3>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative flex flex-col items-center text-center">
                {index < items.length - 1 && <span className="absolute left-[62%] top-8 hidden w-[76%] border-t border-dashed border-slate-300 sm:block" />}
                <span className={cn("relative z-10 grid h-16 w-16 place-items-center rounded-full text-2xl", item.color)}>
                  <Icon className="h-8 w-8" />
                </span>
                <h4 className="mt-4 text-sm font-black text-navy-950">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function JourneyCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-black text-navy-950">Your journey</h3>
          <Link href="/programs" className="text-sm font-black text-electric-700">
            View full plan -&gt;
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-5">
          {journey.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative flex flex-col items-center text-center">
                {index < journey.length - 1 && <span className="absolute left-[58%] top-8 hidden w-[88%] border-t border-dashed border-slate-300 sm:block" />}
                <span className={cn("relative z-10 grid h-16 w-16 place-items-center rounded-full border text-2xl", item.active ? "border-electric-600 bg-electric-600 text-white" : "border-slate-200 bg-slate-50 text-slate-500")}>
                  <Icon className="h-8 w-8" />
                </span>
                <h4 className={cn("mt-4 text-sm font-black", item.active ? "text-electric-700" : "text-navy-950")}>{item.title}</h4>
                <p className="mt-2 text-sm text-slate-500">{item.label}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 rounded-xl bg-blue-50 px-5 py-4 text-sm text-slate-600">
          <Sparkles className="mr-2 inline h-5 w-5 text-electric-600" />
          <b>Tip:</b> Consistency is key. Even a few minutes a day can make a big difference.
        </div>
      </CardContent>
    </Card>
  );
}

function SetupStatCard({ currentStep }: { currentStep: number }) {
  const size = 138;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = currentStep / 6;
  const percent = Math.round(progress * 100);
  const message = currentStep >= 6 ? "All set! Let's go!" : currentStep >= 5 ? "Almost ready!" : "Keep going!";

  return (
    <div className="flex min-h-[310px] flex-col items-center justify-center rounded-2xl bg-white px-8 py-9 text-center shadow-card">
      <div className="relative grid h-[138px] w-[138px] place-items-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#dbeafe" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1268f3"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <span className="relative text-3xl font-black tracking-normal text-black">{percent}%</span>
      </div>
      <h3 className="mt-9 text-xl font-black text-electric-700">Setup Progress</h3>
      <p className="mt-3 text-base font-black text-black">{currentStep} of 6 steps done</p>
      <p className="mt-5 text-base text-slate-600">{message}</p>
    </div>
  );
}
