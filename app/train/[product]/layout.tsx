import type { ReactNode } from "react";

import { CloudSyncGate } from "@/components/cloud-sync-gate";
import { isVoiceFlexProduct } from "@/lib/training-product";

export default async function TrainProductLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;

  if (!isVoiceFlexProduct(product)) {
    return children;
  }

  return <CloudSyncGate productType={product}>{children}</CloudSyncGate>;
}
