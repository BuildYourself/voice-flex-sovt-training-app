import { notFound } from "next/navigation";

import { TrainingLibrary } from "@/components/training-library";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductLibraryPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  if (!isVoiceFlexProduct(product)) notFound();
  return <TrainingLibrary productType={product} />;
}
