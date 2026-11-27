import { notFound } from "next/navigation";

import { RoutineEditor } from "@/components/routine-editor";
import { isRoutineId } from "@/lib/routines";
import { isVoiceFlexProduct } from "@/lib/training-product";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Create or edit one of the person's own routines: ?id=<routine> to edit, ?from=<built-in> or ?add=<exercise> to start one. */
export default async function TrainProductRoutineEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ id?: string | string[]; from?: string | string[]; add?: string | string[] }>;
}) {
  const { product } = await params;
  if (!isVoiceFlexProduct(product)) notFound();
  const query = await searchParams;
  const from = first(query.from);
  return (
    <RoutineEditor
      productType={product}
      routineId={first(query.id)}
      startFrom={isRoutineId(from) ? from : undefined}
      addExercise={first(query.add)}
    />
  );
}
