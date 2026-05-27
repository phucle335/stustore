"use server";

import { revalidatePath } from "next/cache";
import { withAdminAction } from "@/lib/admin/auth";
import * as coupons from "@/lib/admin/data/coupons";
import type { CreateCouponInput, UpdateCouponInput } from "@/lib/supabase/types";

const ADMIN_PATH = "/admin";

function revalidateCoupons() {
  revalidatePath(ADMIN_PATH);
}

export async function getCouponsAction() {
  return withAdminAction(() => coupons.listCoupons());
}

export async function createCouponAction(input: CreateCouponInput) {
  return withAdminAction(async () => {
    const result = await coupons.createCoupon(input);
    if (result.ok) revalidateCoupons();
    return result;
  });
}

export async function updateCouponAction(id: string, input: UpdateCouponInput) {
  return withAdminAction(async () => {
    const result = await coupons.updateCoupon(id, input);
    if (result.ok) revalidateCoupons();
    return result;
  });
}

export async function deleteCouponAction(id: string) {
  return withAdminAction(async () => {
    const result = await coupons.deleteCoupon(id);
    if (result.ok) revalidateCoupons();
    return result;
  });
}
