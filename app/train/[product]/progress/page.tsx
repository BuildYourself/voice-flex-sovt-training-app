import { notFound } from "next/navigation";

import { TrainingProgressDashboard } from "@/components/training-progress-dashboard";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductProgressPage({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;

  if (!isVoiceFlexProduct(product)) {
    notFound();
  }

  return <TrainingProgressDashboard productType={product} />;
}
