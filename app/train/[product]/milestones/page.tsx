import { notFound } from "next/navigation";

import { TrainingMilestones } from "@/components/training-milestones";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductMilestonesPage({
  params
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;

  if (!isVoiceFlexProduct(product)) {
    notFound();
  }

  return <TrainingMilestones productType={product} />;
}
