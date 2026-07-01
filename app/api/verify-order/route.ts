import { NextResponse } from "next/server";

import {
  createVoiceFlexAdminClient,
  ensureOrderProgress,
  getServerEnvironment,
  resolveVerifiedOrder,
  SERVER_ERROR_RESPONSE,
} from "@/lib/order-progress-server";

export const runtime = "nodejs";

type VerifyOrderRequest = {
  orderNumber?: unknown;
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
    const result = await resolveVerifiedOrder(supabase, env, orderNumber);

    if (!result.ok) {
      const statusCode =
        result.status === "not_found" ? 404 : result.status === "not_active" ? 403 : 422;
      return NextResponse.json(result, { status: statusCode });
    }

    await ensureOrderProgress(supabase, result.order.id, result.product.productType);

    return NextResponse.json(
      {
        ok: true,
        status: "verified",
        orderAccessId: result.order.id,
        orderNumber: result.order.amazon_order_number,
        asin: result.asin,
        productType: result.product.productType,
        productName: result.product.productName,
        trainingRoute: result.product.trainingRoute,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[verify-order] Unexpected verification error.", error);
    return NextResponse.json(SERVER_ERROR_RESPONSE, { status: 500 });
  }
}
