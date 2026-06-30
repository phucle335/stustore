import type { DbCoupon } from "@/lib/supabase/types";

export type CouponValidationResult =
  | {
      ok: true;
      coupon: DbCoupon;
      discountAmount: number;
      finalTotal: number;
    }
  | { ok: false; error: string };

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function calculateDiscount(
  subtotal: number,
  coupon: Pick<DbCoupon, "discount_type" | "discount_value">,
): number {
  if (subtotal <= 0) return 0;

  let discount =
    coupon.discount_type === "percent"
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : Math.round(coupon.discount_value);

  return Math.min(discount, subtotal);
}

export function validateCouponForOrder(
  coupon: DbCoupon,
  subtotal: number,
): CouponValidationResult {
  if (!coupon.is_active) {
    return { ok: false, error: "This coupon code is no longer active." };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { ok: false, error: "This coupon code has expired." };
  }

  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, error: "This coupon code has reached its usage limit." };
  }

  if (subtotal < Number(coupon.min_order_amount)) {
    return {
      ok: false,
      error: `Minimum order ${Number(coupon.min_order_amount).toLocaleString("vi-VN")}đ to use this code.`,
    };
  }

  const discountAmount = calculateDiscount(subtotal, coupon);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    ok: true,
    coupon,
    discountAmount,
    finalTotal,
  };
}
