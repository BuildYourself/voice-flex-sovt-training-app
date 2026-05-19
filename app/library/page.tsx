"use client";

import { useState } from "react";
import { Dumbbell, Play, Search, Waves } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { todayExercises } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const filters = ["All", "Warm-Up", "SOVT", "Breath", "Pitch", "Range", "Recovery"];

export default function LibraryPage() {
  const [filter, setFilter] = useState("All");
  const items = todayExercises.concat([
    { ...todayExercises[1], id: "sovt-bubbles", title: "SOVT Straw Bubbles", type: "SOVT", durationMinutes: 7, description: "Use the Voice Flex tool for balanced back pressure and easy tone." },
    { ...todayExercises[3], id: "range-slides", title: "Range Slides", type: "Range", durationMinutes: 12, description: "Explore upper range safely with smooth sirens." }
  ]);
  const visible = filter === "All" ? items : items.filter((item) => item.type.includes(filter) || (filter === "Breath" && item.type === "Breathing"));

  return (
    <AppShell title="Exercise Library" subtitle="Choose a focused drill and keep building your best voice.">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <span className="text-slate-500">Search exercises</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={cn("rounded-xl px-4 py-2 text-sm font-bold", filter === item ? "bg-electric-600 text-white" : "bg-slate-100 text-slate-600")}>{item}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((exercise) => (
          <Card key={exercise.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-electric-700">{exercise.type === "SOVT" ? <Waves className="h-7 w-7" /> : <Dumbbell className="h-7 w-7" />}</div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{exercise.difficulty}</span>
              </div>
              <h2 className="mt-6 text-2xl font-black">{exercise.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{exercise.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-bold text-slate-700">{exercise.durationMinutes} min • {exercise.type}</span>
                <Button><Play className="h-4 w-4 fill-current" />Start</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
