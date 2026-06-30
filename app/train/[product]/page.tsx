import { notFound } from "next/navigation";
import { TrainingEntry } from "@/components/training-entry";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;

  if (!isVoiceFlexProduct(product)) {
    notFound();
  }

  return <TrainingEntry product={product} />;
}
