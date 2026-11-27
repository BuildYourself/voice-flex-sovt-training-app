"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";

import { LevelSelect, SkillChips, TimeStepper, formatClock } from "@/components/custom-routine-bits";
import { TrainingSidebar } from "@/components/training-sidebar";
import { useCustomLibrary } from "@/hooks/use-custom-library";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import {
  customToolLabel,
  getLevelOptions,
  LIBRARY_LIMITS,
  listLibraryExercises,
  newExerciseId,
  normalizeLevel,
  type CustomExercise,
  type CustomToolKind,
  type LibraryExercise,
  type UserLibrary
} from "@/lib/custom-library";
import { getExercise, getExerciseToolLabel, getSetupDemoStep, type ExerciseSkill } from "@/lib/exercises";
import { getDefaultKit, getKitProfile, type KitProfile, type ResistanceLevel } from "@/lib/kits";
import { SKILL_LABELS } from "@/lib/routines";
import type { VoiceFlexProduct } from "@/lib/training-product";
import { cn } from "@/lib/utils";

type Filter = "all" | ExerciseSkill | "other" | "mine";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "breath", label: SKILL_LABELS.breath },
  { id: "flexibility", label: SKILL_LABELS.flexibility },
  { id: "pitch", label: SKILL_LABELS.pitch },
  { id: "speaking", label: SKILL_LABELS.speaking },
  { id: "other", label: "Reset and check" },
  { id: "mine", label: "My exercises" }
];

/** A picture for an exercise card: the shape of the sound if there is one, else the set-up drawing. */
function exerciseImage(item: LibraryExercise, profile: KitProfile, library: UserLibrary): string | null {
  const builtIn = getExercise(item.id);
  if (builtIn) {
    const steps = builtIn.demoSteps?.(profile, item.defaultLevel) ?? [];
    return steps.find((step) => step.imageSrc?.endsWith(".svg"))?.imageSrc ?? steps.find((step) => step.imageSrc)?.imageSrc ?? null;
  }
  const own = library.exercises.find((exercise) => exercise.id === item.id);
  if (own?.tool === "resistance") return getSetupDemoStep(profile, item.defaultLevel).imageSrc ?? null;
  if (own?.tool === "water") return "/images/exercises/water-cup.webp";
  return null;
}

function exerciseDetails(item: LibraryExercise, profile: KitProfile, library: UserLibrary) {
  const builtIn = getExercise(item.id);
  if (builtIn) {
    const text = builtIn.text(profile, item.defaultLevel);
    return {
      tool: getExerciseToolLabel(builtIn, profile, item.defaultLevel),
      description: text.description,
      whatToDo: text.whatToDoNow,
      tips: text.tips,
      avoid: text.avoid
    };
  }
  const own = library.exercises.find((exercise) => exercise.id === item.id);
  return {
    tool: own ? customToolLabel(own, profile, item.defaultLevel) : "",
    description: own?.instructions || "No instructions written yet.",
    whatToDo: "",
    tips: [] as string[],
    avoid: [] as string[]
  };
}

export function TrainingLibrary({ productType }: { productType: VoiceFlexProduct }) {
  const router = useRouter();
  const { kit: storedKit, caps, loading } = useTrainingProgress(productType);
  const kit = storedKit ?? getDefaultKit(productType);
  const profile = useMemo(() => getKitProfile(kit, caps), [kit, caps]);
  const { library, ready, save } = useCustomLibrary(productType);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<CustomExercise | "new" | null>(null);
  const [notice, setNotice] = useState<{ text: string; href?: string } | null>(null);

  const items = useMemo(() => listLibraryExercises(kit, library), [kit, library]);
  const shown = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "mine") return item.custom;
    if (filter === "other") return !item.custom && item.skills.length === 0;
    return item.skills.includes(filter);
  });

  if (loading || !ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Loading the library...</div>
      </main>
    );
  }

  const addToRoutine = (item: LibraryExercise, routineId: string) => {
    const routine = library.routines.find((entry) => entry.id === routineId);
    if (!routine) return;
    setMenuFor(null);
    if (routine.steps.some((step) => step.exercise === item.id)) {
      setNotice({ text: `${item.title} is already in ${routine.title}.`, href: `/train/${productType}/routines?id=${routine.id}` });
      return;
    }
    if (routine.steps.length >= LIBRARY_LIMITS.steps) {
      setNotice({ text: `${routine.title} already has ${LIBRARY_LIMITS.steps} exercises, the most a routine can hold.` });
      return;
    }
    const next: UserLibrary = {
      ...library,
      routines: library.routines.map((entry) =>
        entry.id === routine.id
          ? { ...entry, steps: [...entry.steps, { exercise: item.id, seconds: item.defaultSeconds, level: item.defaultLevel }] }
          : entry
      )
    };
    setNotice(
      save(next)
        ? { text: `Added ${item.title} to ${routine.title}.`, href: `/train/${productType}/routines?id=${routine.id}` }
        : { text: "Couldn't save. Your browser may be blocking storage." }
    );
  };

  const saveExercise = (exercise: CustomExercise) => {
    const exists = library.exercises.some((entry) => entry.id === exercise.id);
    const next: UserLibrary = {
      ...library,
      exercises: exists ? library.exercises.map((entry) => (entry.id === exercise.id ? exercise : entry)) : [...library.exercises, exercise]
    };
    if (save(next)) {
      setEditing(null);
      setFilter("mine");
      setNotice({ text: exists ? `Saved ${exercise.title}.` : `Added ${exercise.title} to your exercises.` });
    } else {
      setNotice({ text: "Couldn't save. Your browser may be blocking storage." });
    }
  };

  const deleteExercise = (exercise: CustomExercise) => {
    const next: UserLibrary = {
      exercises: library.exercises.filter((entry) => entry.id !== exercise.id),
      routines: library.routines.map((routine) => ({ ...routine, steps: routine.steps.filter((step) => step.exercise !== exercise.id) }))
    };
    if (save(next)) {
      setEditing(null);
      setNotice({ text: `Deleted ${exercise.title}.` });
    }
  };

  const atExerciseLimit = library.exercises.length >= LIBRARY_LIMITS.exercises;

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-navy-950">
      <TrainingSidebar productType={productType} activeItem="library" />

      <main className="px-4 pb-16 pt-4 sm:px-6 lg:ml-[272px] lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1280px]">
          <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[30px] font-black leading-tight text-black md:text-[38px]">Exercise library</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Every exercise, written for your {profile.name}. Add any of them to a routine of your own, or write your own exercise.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/train/${productType}/routines`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-electric-600 px-4 text-sm font-black text-white hover:bg-electric-700"
              >
                <Plus className="h-4 w-4" />
                New routine
              </Link>
              <button
                type="button"
                onClick={() => setEditing("new")}
                disabled={atExerciseLimit}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-electric-700 disabled:opacity-40"
              >
                <Pencil className="h-4 w-4" />
                Write your own exercise
              </button>
            </div>
          </header>

          {notice ? (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800" role="status">
              <span>
                {notice.text}
                {notice.href ? (
                  <Link href={notice.href} className="ml-2 underline">
                    Open the routine
                  </Link>
                ) : null}
              </span>
              <button type="button" onClick={() => setNotice(null)} aria-label="Close" className="shrink-0 text-emerald-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter exercises">
            {FILTERS.filter((item) => item.id !== "mine" || library.exercises.length > 0).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-black transition",
                  filter === item.id ? "border-electric-600 bg-electric-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:text-electric-700"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filter === "mine" && !shown.length ? (
            <p className="mt-8 text-slate-600">You haven&apos;t written any exercises yet.</p>
          ) : null}

          <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((item) => {
              const image = exerciseImage(item, profile, library);
              const details = exerciseDetails(item, profile, library);
              const open = openId === item.id;
              const own = item.custom ? library.exercises.find((exercise) => exercise.id === item.id) : undefined;
              return (
                <article key={item.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
                  <div className="grid aspect-[16/9] place-items-center overflow-hidden rounded-2xl bg-slate-50">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="h-full w-full object-contain p-2" loading="lazy" />
                    ) : (
                      <BookOpen className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h2 className="text-lg font-black text-navy-950">{item.title}</h2>
                    {item.custom ? <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase text-amber-700">Yours</span> : null}
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {details.tool} · {formatClock(item.defaultSeconds)}
                  </p>
                  <SkillChips skills={item.skills} className="mt-3" />
                  <p className={cn("mt-3 whitespace-pre-line text-sm leading-6 text-slate-600", !open && "line-clamp-3")}>{details.description}</p>

                  {open && (details.whatToDo || details.tips.length || details.avoid.length) ? (
                    <div className="mt-3 space-y-3 text-sm leading-6">
                      {details.whatToDo ? (
                        <p className="rounded-2xl bg-emerald-50 p-3 text-emerald-900">
                          <span className="font-black">What to do: </span>
                          {details.whatToDo}
                        </p>
                      ) : null}
                      {details.tips.length ? (
                        <ul className="list-inside list-disc text-slate-700">
                          {details.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      ) : null}
                      {details.avoid.length ? (
                        <p className="text-slate-600">
                          <span className="font-black text-navy-950">Avoid: </span>
                          {details.avoid.join(", ").toLowerCase()}.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMenuFor(menuFor === item.id ? null : item.id)}
                        aria-expanded={menuFor === item.id}
                        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-electric-600 px-3.5 text-sm font-black text-white hover:bg-electric-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add to routine
                      </button>
                      {menuFor === item.id ? (
                        <div className="absolute left-0 top-12 z-20 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                          {library.routines.map((routine) => (
                            <button
                              key={routine.id}
                              type="button"
                              onClick={() => addToRoutine(item, routine.id)}
                              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-navy-950 hover:bg-blue-50"
                            >
                              <span className="truncate">{routine.title}</span>
                              {routine.steps.some((step) => step.exercise === item.id) ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => router.push(`/train/${productType}/routines?add=${item.id}`)}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-black text-electric-700 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4" />
                            New routine with this
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                      className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-black text-slate-600 hover:text-electric-700"
                    >
                      {open ? "Less" : "How to"}
                      <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
                    </button>
                    {own ? (
                      <button
                        type="button"
                        onClick={() => setEditing(own)}
                        className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-black text-slate-600 hover:text-electric-700"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>

      {editing ? (
        <ExerciseForm
          profile={profile}
          initial={editing === "new" ? null : editing}
          usedIn={editing === "new" ? 0 : library.routines.filter((routine) => routine.steps.some((step) => step.exercise === editing.id)).length}
          onCancel={() => setEditing(null)}
          onSave={saveExercise}
          onDelete={deleteExercise}
        />
      ) : null}
    </div>
  );
}

/** Write or edit one of your own exercises. */
function ExerciseForm({
  profile,
  initial,
  usedIn,
  onCancel,
  onSave,
  onDelete
}: {
  profile: KitProfile;
  initial: CustomExercise | null;
  usedIn: number;
  onCancel: () => void;
  onSave: (exercise: CustomExercise) => void;
  onDelete: (exercise: CustomExercise) => void;
}) {
  const levelOptions = getLevelOptions(profile);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [tool, setTool] = useState<CustomToolKind>(initial?.tool ?? "resistance");
  const [seconds, setSeconds] = useState(initial?.seconds ?? 60);
  const [level, setLevel] = useState<ResistanceLevel>(normalizeLevel(profile, initial?.level ?? "light"));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const tools: { id: CustomToolKind; label: string }[] = [
    { id: "resistance", label: profile.kit === "go" ? "With the trainer" : "With a straw" },
    ...(profile.hasWater ? [{ id: "water" as const, label: "Straw in water" }] : []),
    { id: "none", label: "No tool" }
  ];

  const canSave = title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="exercise-form-title">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="exercise-form-title" className="text-xl font-black text-navy-950">
            {initial ? "Edit your exercise" : "Write your own exercise"}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-black text-navy-950" htmlFor="exercise-title">
          Name
        </label>
        <input
          id="exercise-title"
          ref={titleRef}
          value={title}
          maxLength={LIBRARY_LIMITS.title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Lip trill scales"
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-base font-bold text-navy-950 focus:border-electric-600 focus:outline-none"
        />

        <label className="mt-5 block text-sm font-black text-navy-950" htmlFor="exercise-instructions">
          How to do it
        </label>
        <textarea
          id="exercise-instructions"
          value={instructions}
          maxLength={LIBRARY_LIMITS.instructions}
          onChange={(event) => setInstructions(event.target.value)}
          rows={5}
          placeholder="What to do, in your own words. This shows on screen while the timer runs."
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-base leading-7 text-navy-950 focus:border-electric-600 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {instructions.length}/{LIBRARY_LIMITS.instructions}
        </p>

        <p className="mt-3 text-sm font-black text-navy-950">Tool</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Tool">
          {tools.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={tool === option.id}
              onClick={() => setTool(option.id)}
              className={cn(
                "h-11 rounded-xl border px-4 text-sm font-black",
                tool === option.id ? "border-electric-600 bg-electric-600 text-white" : "border-slate-200 bg-white text-slate-700"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-sm font-black text-navy-950">Usual time</p>
            <div className="mt-2">
              <TimeStepper seconds={seconds} onChange={setSeconds} label="Usual time" />
            </div>
          </div>
          {tool === "resistance" && levelOptions.length > 1 ? (
            <div className="min-w-0">
              <p className="text-sm font-black text-navy-950">Usual resistance</p>
              <div className="mt-2">
                <LevelSelect value={level} options={levelOptions} onChange={setLevel} label="Usual resistance" />
              </div>
            </div>
          ) : null}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">You can change the time and resistance for each routine you add it to.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave({
                id: initial?.id ?? newExerciseId(),
                title: title.trim(),
                instructions: instructions.trim(),
                tool,
                seconds,
                level
              })
            }
            className="inline-flex h-12 items-center rounded-xl bg-electric-600 px-6 font-black text-white hover:bg-electric-700 disabled:opacity-40"
          >
            Save exercise
          </button>
          <button type="button" onClick={onCancel} className="h-12 rounded-xl px-4 font-black text-slate-600 hover:text-navy-950">
            Cancel
          </button>
          {initial ? (
            confirmDelete ? (
              <span className="ml-auto flex items-center gap-2 text-sm font-bold text-red-700">
                {usedIn ? `It comes out of ${usedIn} routine${usedIn === 1 ? "" : "s"}. Delete?` : "Delete?"}
                <button type="button" onClick={() => onDelete(initial)} className="h-10 rounded-xl bg-red-600 px-3 font-black text-white">
                  Delete
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 rounded-xl px-2 font-black text-slate-600">
                  Keep
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto inline-flex h-12 items-center gap-1.5 rounded-xl px-3 text-sm font-black text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
