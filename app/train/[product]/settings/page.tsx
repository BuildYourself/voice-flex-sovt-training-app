import { notFound } from "next/navigation";

import { TrainingSettings } from "@/components/training-settings";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductSettingsPage({
  params
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;

  if (!isVoiceFlexProduct(product)) {
    notFound();
  }

  return <TrainingSettings productType={product} />;
}
