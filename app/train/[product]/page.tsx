import { notFound } from "next/navigation";
import { TrainingEntry } from "@/components/training-entry";
import { parseCustomRoutineParam } from "@/lib/custom-library";
import { isRoutineId } from "@/lib/routines";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductPage({
  params,
  searchParams
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ routine?: string | string[]; setup?: string | string[] }>;
}) {
  const { product } = await params;
  const query = await searchParams;

  if (!isVoiceFlexProduct(product)) {
    notFound();
  }

  const routine = Array.isArray(query.routine) ? query.routine[0] : query.routine;
  const setup = Array.isArray(query.setup) ? query.setup[0] : query.setup;

  return (
    <TrainingEntry
      product={product}
      routineId={isRoutineId(routine) ? routine : undefined}
      customRoutineId={parseCustomRoutineParam(routine) ?? undefined}
      showSetup={setup === "1"}
    />
  );
}
