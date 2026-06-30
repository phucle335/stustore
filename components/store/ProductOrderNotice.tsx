"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/store/ToastProvider";

export function ProductOrderNotice() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const cancelled = searchParams.get("order_cancelled");
    if (cancelled !== "1") return;

    showToast("Order cancelled", "error", "bottom-right");
  }, [searchParams, showToast]);

  return null;
}

