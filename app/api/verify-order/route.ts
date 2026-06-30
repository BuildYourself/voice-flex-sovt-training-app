import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type VerifyOrderRequest = {
  orderNumber?: unknown;
};

type AmazonOrderAccessRow = {
  amazon_order_number: string;
  asin: string | null;
  shipped: boolean | null;
};

type ProductMatch = {
  productType: "go" | "pro";
  productName: "Voice Flex GO" | "Voice Flex Pro";
  trainingRoute: "/train/go" | "/train/pro";
};

const SERVER_ERROR_RESPONSE = {
  ok: false,
  status: "server_error",
  message: "We couldn’t verify your order right now. Please try again later.",
} as const;

function normalizeAsin(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

function getProductMatch(asin: string, goAsin: string, proAsin: string): ProductMatch | null {
  if (asin === goAsin) {
    return {
      productType: "go",
      productName: "Voice Flex GO",
      trainingRoute: "/train/go",
    };
  }

  if (asin === proAsin) {
    return {
      productType: "pro",
      productName: "Voice Flex Pro",
      trainingRoute: "/train/pro",
    };
  }

  return null;
}

function getServerEnvironment() {
  const supabaseUrl = process.env.VOICEFLEX_DB_URL;
  const serviceRoleKey = process.env.VOICEFLEX_SERVICE_ROLE_KEY;
  const goAsin = normalizeAsin(process.env.VOICE_FLEX_GO_ASIN);
  const proAsin = normalizeAsin(process.env.VOICE_FLEX_PRO_ASIN);

  if (!supabaseUrl || !serviceRoleKey || !goAsin || !proAsin) {
    return null;
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    goAsin,
    proAsin,
  };
}

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

    const supabase = createClient(env.supabaseUrl, env.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("amazon_order_access")
      .select("amazon_order_number, asin, shipped")
      .eq("amazon_order_number", orderNumber)
      .maybeSingle<AmazonOrderAccessRow>();

    if (error) {
      console.error("[verify-order] Supabase query failed.", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(SERVER_ERROR_RESPONSE, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          status: "not_found",
          message:
            "We couldn’t verify this order yet. If you purchased recently, please wait up to 24 hours for your training access to update, then try again.",
        },
        { status: 404 },
      );
    }

    if (!data.shipped) {
      return NextResponse.json(
        {
          ok: false,
          status: "not_active",
          message: "We found your order, but your training access is not active yet. Please try again later.",
        },
        { status: 403 },
      );
    }

    const normalizedAsin = normalizeAsin(data.asin);
    const product = getProductMatch(normalizedAsin, env.goAsin, env.proAsin);

    if (!product) {
      console.error("[verify-order] Unsupported product ASIN.", {
        orderNumber: data.amazon_order_number,
        asin: normalizedAsin,
      });

      return NextResponse.json(
        {
          ok: false,
          status: "unsupported_product",
          message: "We found your order, but we couldn’t match it to a Voice Flex training path. Please contact support.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        status: "verified",
        orderNumber: data.amazon_order_number,
        asin: normalizedAsin,
        productType: product.productType,
        productName: product.productName,
        trainingRoute: product.trainingRoute,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[verify-order] Unexpected verification error.", error);
    return NextResponse.json(SERVER_ERROR_RESPONSE, { status: 500 });
  }
}
