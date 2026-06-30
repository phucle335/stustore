import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/account/require-user";
import * as couponData from "@/lib/admin/data/coupons";
import { validateCouponForOrder } from "@/lib/store/apply-coupon";

type Body = { code?: string; subtotal?: number };

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const subtotal = Number(body.subtotal);
  if (!body.code?.trim() || !Number.isFinite(subtotal) || subtotal <= 0) {
    return NextResponse.json(
      { error: "Invalid coupon code or order subtotal." },
      { status: 400 },
    );
  }

  const couponResult = await couponData.getCouponByCode(body.code);
  if (!couponResult.ok) {
    return NextResponse.json({ error: couponResult.error }, { status: 400 });
  }

  const validated = validateCouponForOrder(couponResult.data, subtotal);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      code: validated.coupon.code,
      discount_amount: validated.discountAmount,
      final_total: validated.finalTotal,
      discount_type: validated.coupon.discount_type,
      discount_value: validated.coupon.discount_value,
    },
  });
}
