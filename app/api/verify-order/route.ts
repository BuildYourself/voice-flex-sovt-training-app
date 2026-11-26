import { NextResponse } from "next/server";

import {
  createVoiceFlexAdminClient,
  ensureOrderProgress,
  getServerEnvironment,
  listOrderProfiles,
  normalizeProfileName,
  parseProfileSlot,
  resolveVerifiedOrder,
  SERVER_ERROR_RESPONSE,
} from "@/lib/order-progress-server";
import { isVoiceFlexProduct } from "@/lib/training-product";

export const runtime = "nodejs";

type VerifyOrderRequest = {
  orderNumber?: unknown;
  /** For orders with two products: which one this person trains with. */
  productType?: unknown;
  /** For orders with 2+ units: which person (1 = first). */
  profileSlot?: unknown;
  /** Name for a new profile. */
  profileName?: unknown;
};

export async function POST(request: Request) {
  try {
    let body: VerifyOrderRequest = {};

    try {
      body = (await request.json()) as VerifyOrderRequest;
    } catch {
      body = {};
    }

    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";

    if (!orderNumber) {
      return NextResponse.json(
        {
          ok: false,
          status: "missing_order_number",
          message: "Enter your Amazon order number to continue.",
        },
        { status: 400 },
      );
    }

    const env = getServerEnvironment();

    if (!env) {
      console.error("[verify-order] Missing required server environment configuration.");
      return NextResponse.json(SERVER_ERROR_RESPONSE, { status: 500 });
    }

    const supabase = createVoiceFlexAdminClient(env);
    const requestedProduct = isVoiceFlexProduct(body.productType) ? body.productType : undefined;
    const result = await resolveVerifiedOrder(supabase, env, orderNumber, requestedProduct);

    if (!result.ok) {
      const statusCode =
        result.status === "not_found" ? 404 : result.status === "not_active" ? 403 : 422;
      return NextResponse.json(result, { status: statusCode });
    }

    const products = result.products.map((entry) => ({
      productType: entry.productType,
      productName: entry.productName,
      units: entry.units,
      sourceAsin: entry.sourceAsin,
    }));

    // Two products in one order (e.g. Pro + GO): ask which one first.
    if (!requestedProduct && products.length > 1) {
      return NextResponse.json({
        ok: true,
        status: "choose_product",
        orderNumber: result.order.amazon_order_number,
        products,
      });
    }

    const productType = result.product.productType;
    const seats = result.seats;
    let profileSlot = 1;
    let profileName: string | null = null;

    // 2+ units: every person gets their own profile, so ask who is training.
    if (seats > 1) {
      const requestedSlot = parseProfileSlot(body.profileSlot, seats);
      if (!requestedSlot) {
        const profiles = await listOrderProfiles(supabase, result.order.id, productType);
        return NextResponse.json({
          ok: true,
          status: "choose_profile",
          orderNumber: result.order.amazon_order_number,
          productType,
          productName: result.product.productName,
          seats,
          profiles,
          products,
        });
      }
      profileSlot = requestedSlot;
      profileName = normalizeProfileName(body.profileName);
    }

    const progress = await ensureOrderProgress(supabase, result.order.id, productType, profileSlot, profileName);

    return NextResponse.json(
      {
        ok: true,
        status: "verified",
        orderAccessId: result.order.id,
        orderNumber: result.order.amazon_order_number,
        asin: result.asin,
        sourceAsin: result.sourceAsin,
        kit: result.kit,
        productType: result.product.productType,
        productName: result.product.productName,
        trainingRoute: result.product.trainingRoute,
        profileSlot,
        profileName: progress.profile_name ?? null,
        seats,
        products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[verify-order] Unexpected verification error.", error);
    return NextResponse.json(SERVER_ERROR_RESPONSE, { status: 500 });
  }
}
