"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Search, Trash2, X } from "lucide-react";

import { LevelSelect, SkillChips, TimeStepper, formatClock } from "@/components/custom-routine-bits";
import { TrainingSidebar } from "@/components/training-sidebar";
import { useCustomLibrary } from "@/hooks/use-custom-library";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import {
  customRoutineParam,
  getExerciseName,
  getLevelOptions,
  isCustomSlot,
  LIBRARY_LIMITS,
  listLibraryExercises,
  newRoutineId,
  nextRoutineSlot,
  normalizeLevel,
  stepsFromBuiltIn,
  type CustomRoutine,
  type CustomRoutineStep,
  type LibraryExercise,
  type UserLibrary
} from "@/lib/custom-library";
import type { ExerciseSkill } from "@/lib/exercises";
import { getDefaultKit, getKitProfile } from "@/lib/kits";
import { ROUTINE_ORDER, ROUTINES, SKILL_LABELS, type RoutineId } from "@/lib/routines";
import { getProgress } from "@/lib/training-progress";
import type { VoiceFlexProduct } from "@/lib/training-product";
import { cn } from "@/lib/utils";

/** Slots this device has history for, so a new routine never takes over an old routine's history. */
function usedCustomSlots(productType: VoiceFlexProduct) {
  const slots = new Set<number>();
  Object.keys(getProgress(productType).completedExercises).forEach((key) => {
    const slot = Number(key.split("-").pop());
    if (isCustomSlot(slot)) slots.add(slot);
  });
  return slots;
}

export function RoutineEditor({
  productType,
  routineId,
  startFrom,
  addExercise
}: {
  productType: VoiceFlexProduct;
  routineId?: string;
  startFrom?: RoutineId;
  addExercise?: string;
}) {
  const router = useRouter();
  const { kit: storedKit, caps, loading } = useTrainingProgress(productType);
  const kit = storedKit ?? getDefaultKit(productType);
  const profile = useMemo(() => getKitProfile(kit, caps), [kit, caps]);
  const levelOptions = useMemo(() => getLevelOptions(profile), [profile]);
  const { library, ready, save } = useCustomLibrary(productType);
  const exercises = useMemo(() => listLibraryExercises(kit, library), [kit, library]);
  const exerciseById = useMemo(() => new Map(exercises.map((item) => [item.id, item])), [exercises]);

  const [initialised, setInitialised] = useState(false);
  const [existing, setExisting] = useState<CustomRoutine | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState<CustomRoutineStep[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || loading || initialised) return;
    setInitialised(true);
    if (routineId) {
      const routine = library.routines.find((item) => item.id === routineId);
      if (!routine) {
        setNotFound(true);
        return;
      }
      setExisting(routine);
      setTitle(routine.title);
      setSteps(routine.steps.map((step) => ({ ...step, level: normalizeLevel(profile, step.level) })));
      return;
    }
    if (startFrom) {
      setTitle(`My ${ROUTINES[startFrom].title}`.slice(0, LIBRARY_LIMITS.title));
      setSteps(stepsFromBuiltIn(startFrom, kit));
      return;
    }
    const first = addExercise ? exercises.find((item) => item.id === addExercise) : undefined;
    if (first) setSteps([{ exercise: first.id, seconds: first.defaultSeconds, level: first.defaultLevel }]);
  }, [ready, loading, initialised, routineId, startFrom, addExercise, library, exercises, kit, profile]);

  if (loading || !ready || !initialised) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Loading...</div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-xl font-black">This routine isn&apos;t here any more</p>
          <p className="mt-2 text-slate-600">It may have been deleted on another device.</p>
          <Link href={`/train/${productType}`} className="mt-5 inline-flex h-11 items-center rounded-xl bg-electric-600 px-5 font-black text-white">
            Back to routines
          </Link>
        </div>
      </main>
    );
  }

  const totalSeconds = steps.reduce((sum, step) => sum + step.seconds, 0);
  const inRoutine = new Set(steps.map((step) => step.exercise));
  const atRoutineLimit = !existing && library.routines.length >= LIBRARY_LIMITS.routines;
  const canSave = title.trim().length > 0 && steps.length > 0 && !atRoutineLimit;

  const updateStep = (index: number, patch: Partial<CustomRoutineStep>) =>
    setSteps((current) => current.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  const moveStep = (index: number, delta: number) =>
    setSteps((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const removeStep = (index: number) => setSteps((current) => current.filter((_, i) => i !== index));
  const addStep = (item: LibraryExercise) => {
    setSteps((current) =>
      current.some((step) => step.exercise === item.id) || current.length >= LIBRARY_LIMITS.steps
        ? current
        : [...current, { exercise: item.id, seconds: item.defaultSeconds, level: item.defaultLevel }]
    );
  };

  const persist = (start: boolean) => {
    setError(null);
    let routine: CustomRoutine;
    let next: UserLibrary;
    if (existing) {
      routine = { ...existing, title: title.trim(), steps };
      next = { ...library, routines: library.routines.map((item) => (item.id === existing.id ? routine : item)) };
    } else {
      const slot = nextRoutineSlot(library, usedCustomSlots(productType));
      if (!slot) {
        setError("You've reached the most routines you can keep. Delete one to make room.");
        return;
      }
      routine = { id: newRoutineId(), slot, title: title.trim(), steps };
      next = { ...library, routines: [...library.routines, routine] };
    }
    if (!save(next)) {
      setError("Couldn't save. Your browser may be blocking storage.");
      return;
    }
    router.push(start ? `/train/${productType}?routine=${customRoutineParam(routine.id)}` : `/train/${productType}`);
  };

  const remove = () => {
    if (!existing) return;
    if (save({ ...library, routines: library.routines.filter((item) => item.id !== existing.id) })) {
      router.push(`/train/${productType}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-navy-950">
      <TrainingSidebar productType={productType} activeItem="sessions" />

      <main className="px-4 pb-32 pt-4 sm:px-6 lg:ml-[272px] lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[920px]">
          <Link href={`/train/${productType}`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-electric-700">
            <ArrowLeft className="h-4 w-4" />
            Routines
          </Link>
          <h1 className="mt-3 text-[30px] font-black leading-tight text-black md:text-[38px]">{existing ? "Edit your routine" : "Build your own routine"}</h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Pick the exercises, put them in order, and set the time and resistance for each one.
          </p>

          <label htmlFor="routine-title" className="mt-7 block text-sm font-black text-navy-950">
            Name
          </label>
          <input
            id="routine-title"
            value={title}
            maxLength={LIBRARY_LIMITS.title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Before choir"
            className="mt-2 h-12 w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 text-base font-bold text-navy-950 focus:border-electric-600 focus:outline-none"
          />

          <section className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-black text-navy-950">Exercises</h2>
              <p className="text-sm font-bold text-slate-500">
                {steps.length} of {LIBRARY_LIMITS.steps} · {formatClock(totalSeconds)} total
              </p>
            </div>

            {steps.length === 0 && !existing ? (
              <div className="mt-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-5">
                <p className="font-black text-navy-950">Start from one of the routines</p>
                <p className="mt-1 text-sm text-slate-600">You get its exercises to change. Or start empty and add your own picks.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ROUTINE_ORDER.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSteps(stepsFromBuiltIn(id, kit));
                        if (!title.trim()) setTitle(`My ${ROUTINES[id].title}`.slice(0, LIBRARY_LIMITS.title));
                      }}
                      className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-electric-700"
                    >
                      {ROUTINES[id].title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <ol className="mt-3 space-y-3">
              {steps.map((step, index) => {
                const item = exerciseById.get(step.exercise);
                const showLevel = item?.toolKind === "resistance" && levelOptions.length > 1;
                return (
                  <li key={step.exercise} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-black text-electric-700">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-navy-950">
                          {getExerciseName(step.exercise, library, profile)}
                          {item?.custom ? <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black uppercase text-amber-700">Yours</span> : null}
                        </p>
                        {!item ? <p className="text-sm text-red-600">This exercise doesn&apos;t work with your kit and will be skipped.</p> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveStep(index, -1)}
                          disabled={index === 0}
                          aria-label="Move up"
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, 1)}
                          disabled={index === steps.length - 1}
                          aria-label="Move down"
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          aria-label="Remove"
                          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 pl-11">
                      <TimeStepper seconds={step.seconds} onChange={(seconds) => updateStep(index, { seconds })} />
                      {showLevel ? (
                        <LevelSelect value={normalizeLevel(profile, step.level)} options={levelOptions} onChange={(level) => updateStep(index, { level })} />
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={steps.length >= LIBRARY_LIMITS.steps}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-white font-black text-electric-700 hover:border-electric-600 disabled:opacity-40 sm:w-auto sm:px-6"
            >
              <Plus className="h-5 w-5" />
              Add an exercise
            </button>
            <p className="mt-3 text-sm text-slate-500">
              Want an exercise that isn&apos;t here? Write it in the{" "}
              <Link href={`/train/${productType}/library`} className="font-black text-electric-700 underline">
                Library
              </Link>{" "}
              first (save this routine before you go).
            </p>
          </section>

          {error ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
          {atRoutineLimit ? (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              You have {LIBRARY_LIMITS.routines} routines, the most you can keep. Delete one to make room.
            </p>
          ) : null}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:left-[272px]">
        <div className="mx-auto flex max-w-[920px] flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => persist(true)}
            disabled={!canSave}
            className="inline-flex h-12 items-center rounded-xl bg-electric-600 px-5 font-black text-white hover:bg-electric-700 disabled:opacity-40"
          >
            Save and start
          </button>
          <button
            type="button"
            onClick={() => persist(false)}
            disabled={!canSave}
            className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-5 font-black text-navy-950 hover:border-blue-200 disabled:opacity-40"
          >
            Save
          </button>
          {existing ? (
            confirmDelete ? (
              <span className="ml-auto flex items-center gap-2 text-sm font-bold text-red-700">
                Delete this routine?
                <button type="button" onClick={remove} className="h-10 rounded-xl bg-red-600 px-3 font-black text-white">
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

      {pickerOpen ? <ExercisePicker items={exercises} added={inRoutine} onAdd={addStep} onClose={() => setPickerOpen(false)} full={steps.length >= LIBRARY_LIMITS.steps} /> : null}
    </div>
  );
}

type PickerFilter = "all" | ExerciseSkill | "mine";

function ExercisePicker({
  items,
  added,
  onAdd,
  onClose,
  full
}: {
  items: LibraryExercise[];
  added: Set<string>;
  onAdd: (item: LibraryExercise) => void;
  onClose: () => void;
  full: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PickerFilter>("all");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filters: { id: PickerFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "breath", label: SKILL_LABELS.breath },
    { id: "flexibility", label: SKILL_LABELS.flexibility },
    { id: "pitch", label: SKILL_LABELS.pitch },
    { id: "speaking", label: SKILL_LABELS.speaking },
    ...(items.some((item) => item.custom) ? [{ id: "mine" as const, label: "Mine" }] : [])
  ];
  const needle = query.trim().toLowerCase();
  const shown = items.filter((item) => {
    if (needle && !item.title.toLowerCase().includes(needle)) return false;
    if (filter === "all") return true;
    if (filter === "mine") return item.custom;
    return item.skills.includes(filter);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="border-b border-slate-100 p-5 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="picker-title" className="text-xl font-black text-navy-950">
              Add an exercise
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search exercises"
              className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-base focus:border-electric-600 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-3 text-sm font-black",
                  filter === item.id ? "border-electric-600 bg-electric-600 text-white" : "border-slate-200 bg-white text-slate-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto p-3">
          {shown.map((item) => {
            const isAdded = added.has(item.id);
            return (
              <li key={item.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="font-black text-navy-950">
                    {item.title}
                    {item.custom ? <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black uppercase text-amber-700">Yours</span> : null}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{formatClock(item.defaultSeconds)}</span>
                    <SkillChips skills={item.skills} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  disabled={isAdded || full}
                  className={cn(
                    "h-10 shrink-0 rounded-xl px-4 text-sm font-black",
                    isAdded ? "bg-emerald-50 text-emerald-700" : "bg-electric-600 text-white hover:bg-electric-700 disabled:opacity-40"
                  )}
                >
                  {isAdded ? "Added" : "Add"}
                </button>
              </li>
            );
          })}
          {!shown.length ? <li className="p-4 text-center text-sm text-slate-500">No exercises match.</li> : null}
        </ul>
        <div className="border-t border-slate-100 p-4">
          <button type="button" onClick={onClose} className="h-12 w-full rounded-xl bg-navy-950 font-black text-white">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
