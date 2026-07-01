import type { VoiceFlexProduct } from "@/lib/training-product";

export type VerifiedOrderProduct = {
  orderAccessId: string;
  productType: VoiceFlexProduct;
  asin: string;
  sku?: string;
  productName: string;
  orderNumber?: string;
  trainingRoute?: `/train/${VoiceFlexProduct}`;
};

export type VerifyOrderResult =
  | {
      ok: true;
      product: VerifiedOrderProduct;
    }
  | {
      ok: false;
      status: string;
      message: string;
    };

type VerifyOrderApiResponse =
  | {
      ok: true;
      status: "verified";
      orderAccessId: string;
      orderNumber: string;
      asin: string;
      productType: VoiceFlexProduct;
      productName: string;
      trainingRoute: `/train/${VoiceFlexProduct}`;
    }
  | {
      ok: false;
      status: string;
      message: string;
    };

const FALLBACK_ERROR =
  "We couldn’t verify your order right now. Please try again later.";

function isVerifyOrderApiResponse(value: unknown): value is VerifyOrderApiResponse {
  if (!value || typeof value !== "object") return false;

  const response = value as Record<string, unknown>;

  if (response.ok === true) {
    return (
      response.status === "verified" &&
      typeof response.orderAccessId === "string" &&
      typeof response.orderNumber === "string" &&
      typeof response.asin === "string" &&
      (response.productType === "go" || response.productType === "pro") &&
      typeof response.productName === "string" &&
      (response.trainingRoute === "/train/go" || response.trainingRoute === "/train/pro")
    );
  }

  return (
    response.ok === false &&
    typeof response.status === "string" &&
    typeof response.message === "string"
  );
}

function toFallbackResult(): VerifyOrderResult {
  return {
    ok: false,
    status: "server_error",
    message: FALLBACK_ERROR,
  };
}

export async function verifyOrderNumber(
  orderNumber: string,
): Promise<VerifyOrderResult> {
  const normalizedOrderNumber = orderNumber.trim();

  if (!normalizedOrderNumber) {
    return {
      ok: false,
      status: "missing_order_number",
      message: "Enter your Amazon order number to continue.",
    };
  }

  try {
    const response = await fetch("/api/verify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNumber: normalizedOrderNumber }),
    });

    const payload: unknown = await response.json();

    if (!isVerifyOrderApiResponse(payload)) {
      return toFallbackResult();
    }

    if (!payload.ok) {
      return {
        ok: false,
        status: payload.status,
        message: payload.message,
      };
    }

    return {
      ok: true,
      product: {
        productType: payload.productType,
        orderAccessId: payload.orderAccessId,
        asin: payload.asin,
        productName: payload.productName,
        orderNumber: payload.orderNumber,
        trainingRoute: payload.trainingRoute,
      },
    };
  } catch (error) {
    console.warn("[order-access] Order verification request failed.", error);
    return toFallbackResult();
  }
};
