"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Star } from "lucide-react";

import { getProductName, type VoiceFlexProduct } from "@/lib/training-product";
import { getReviewUrl, markReviewClicked, shouldShowReviewRequest, snoozeReviewRequest } from "@/lib/review-request";
import { cn } from "@/lib/utils";

/**
 * Neutral "share your experience" ask. Same text for every user, no rating
 * question first, nothing offered in return (Amazon's review rules).
 */
export function ReviewRequest({
  productType,
  variant = "card",
  onDone
}: {
  productType: VoiceFlexProduct;
  variant?: "card" | "modal";
  onDone?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [href, setHref] = useState("");

  useEffect(() => {
    setVisible(shouldShowReviewRequest(productType));
    setHref(getReviewUrl(productType));
  }, [productType]);

  if (!visible || !href) return null;

  const productName = getProductName(productType);
  const dark = variant === "modal";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center",
        dark ? "border-white/20 bg-white/5 text-white" : "border-slate-200 bg-white text-navy-950 shadow-card"
      )}
    >
      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", dark ? "bg-white/10 text-amber-300" : "bg-amber-50 text-amber-500")}>
        <Star className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-black">Share your experience on Amazon</p>
        <p className={cn("mt-1 text-sm leading-6", dark ? "text-slate-300" : "text-slate-600")}>
          An honest review of your {productName} helps other singers and speakers decide. It takes about a minute.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            markReviewClicked(productType);
            setVisible(false);
            onDone?.();
          }}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-electric-600 px-4 text-sm font-black text-white hover:bg-electric-700"
        >
          Write a review
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => {
            snoozeReviewRequest(productType);
            setVisible(false);
            onDone?.();
          }}
          className={cn("text-sm font-bold", dark ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-navy-950")}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
