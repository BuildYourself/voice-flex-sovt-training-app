import { isVoiceFlexKit, type VoiceFlexKit } from "@/lib/kits";
import { isVoiceFlexProduct, type VoiceFlexProduct } from "@/lib/training-product";

export type VerifiedOrderProduct = {
  orderAccessId: string;
  productType: VoiceFlexProduct;
  asin: string;
  sku?: string;
  productName: string;
  orderNumber?: string;
  trainingRoute?: `/train/${VoiceFlexProduct}`;
  sourceAsin?: string;
  kit?: VoiceFlexKit;
  /** Which person on the order (1 = first). */
  profileSlot: number;
  profileName: string | null;
  /** Units of this product on the order: one profile per unit. */
  seats: number;
};

/** A product inside an order that holds two (e.g. Pro + GO). */
export type OrderProductChoice = {
  productType: VoiceFlexProduct;
  productName: string;
  units: number;
};

/** A person already training on a multi-unit order. */
export type OrderProfileChoice = {
  slot: number;
  name: string | null;
  lastPracticeDate: string | null;
  totalMinutes: number;
  routinesCompleted: number;
};

export type VerifyOrderOptions = {
  productType?: VoiceFlexProduct;
  profileSlot?: number;
  profileName?: string;
};

export type VerifyOrderResult =
  | { ok: true; status: "verified"; product: VerifiedOrderProduct }
  | { ok: true; status: "choose_product"; orderNumber: string; products: OrderProductChoice[] }
  | {
      ok: true;
      status: "choose_profile";
      orderNumber: string;
      productType: VoiceFlexProduct;
      productName: string;
      seats: number;
      profiles: OrderProfileChoice[];
      products: OrderProductChoice[];
    }
  | { ok: false; status: string; message: string };

const FALLBACK_ERROR =
  "We couldn’t verify your order right now. Please try again later.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readProducts(value: unknown): OrderProductChoice[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .filter((item) => isVoiceFlexProduct(item.productType) && typeof item.productName === "string")
    .map((item) => ({
      productType: item.productType as VoiceFlexProduct,
      productName: item.productName as string,
      units: Math.max(1, Number(item.units) || 1),
    }));
}

function readProfiles(value: unknown): OrderProfileChoice[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).map((item) => ({
    slot: Math.max(1, Number(item.slot) || 1),
    name: typeof item.name === "string" ? item.name : null,
    lastPracticeDate: typeof item.lastPracticeDate === "string" ? item.lastPracticeDate : null,
    totalMinutes: Number(item.totalMinutes) || 0,
    routinesCompleted: Number(item.routinesCompleted) || 0,
  }));
}

function toResult(payload: unknown): VerifyOrderResult | null {
  if (!isRecord(payload)) return null;

  if (payload.ok === false) {
    return typeof payload.status === "string" && typeof payload.message === "string"
      ? { ok: false, status: payload.status, message: payload.message }
      : null;
  }

  if (payload.ok !== true || typeof payload.orderNumber !== "string") return null;

  if (payload.status === "choose_product") {
    const products = readProducts(payload.products);
    return products.length > 1 ? { ok: true, status: "choose_product", orderNumber: payload.orderNumber, products } : null;
  }

  if (payload.status === "choose_profile") {
    if (!isVoiceFlexProduct(payload.productType) || typeof payload.productName !== "string") return null;
    return {
      ok: true,
      status: "choose_profile",
      orderNumber: payload.orderNumber,
      productType: payload.productType,
      productName: payload.productName,
      seats: Math.max(1, Number(payload.seats) || 1),
      profiles: readProfiles(payload.profiles),
      products: readProducts(payload.products),
    };
  }

  if (
    payload.status === "verified" &&
    typeof payload.orderAccessId === "string" &&
    typeof payload.asin === "string" &&
    isVoiceFlexProduct(payload.productType) &&
    typeof payload.productName === "string" &&
    payload.trainingRoute === `/train/${payload.productType}`
  ) {
    return {
      ok: true,
      status: "verified",
      product: {
        productType: payload.productType,
        orderAccessId: payload.orderAccessId,
        asin: payload.asin,
        productName: payload.productName,
        orderNumber: payload.orderNumber,
        trainingRoute: payload.trainingRoute as `/train/${VoiceFlexProduct}`,
        sourceAsin: typeof payload.sourceAsin === "string" ? payload.sourceAsin : undefined,
        kit: isVoiceFlexKit(payload.kit) ? payload.kit : undefined,
        profileSlot: Math.max(1, Number(payload.profileSlot) || 1),
        profileName: typeof payload.profileName === "string" ? payload.profileName : null,
        seats: Math.max(1, Number(payload.seats) || 1),
      },
    };
  }

  return null;
}

export async function verifyOrderNumber(
  orderNumber: string,
  options: VerifyOrderOptions = {},
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
      body: JSON.stringify({ orderNumber: normalizedOrderNumber, ...options }),
    });

    const result = toResult(await response.json());
    return result ?? { ok: false, status: "server_error", message: FALLBACK_ERROR };
  } catch (error) {
    console.warn("[order-access] Order verification request failed.", error);
    return { ok: false, status: "server_error", message: FALLBACK_ERROR };
  }
}
