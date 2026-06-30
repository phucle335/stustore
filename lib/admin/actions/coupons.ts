"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin, withAdminAction } from "@/lib/admin/auth";
import * as coupons from "@/lib/admin/data/coupons";
import type { CreateCouponInput, UpdateCouponInput } from "@/lib/supabase/types";
import { logAdminAuditAndNotification } from "@/lib/admin/audit/log";

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
    if (result.ok) {
      revalidateCoupons();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "coupon_created",
            entityType: "coupon",
            entityId: result.data.id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin created coupon",
            body: `Created coupon ${result.data.code}`,
            entityType: "coupon",
            entityId: result.data.id,
          },
        );
      }
    }
    return result;
  });
}

export async function updateCouponAction(id: string, input: UpdateCouponInput) {
  return withAdminAction(async () => {
    const result = await coupons.updateCoupon(id, input);
    if (result.ok) {
      revalidateCoupons();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "coupon_updated",
            entityType: "coupon",
            entityId: id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin updated coupon",
            body: `Updated coupon ${id}`,
            entityType: "coupon",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function deleteCouponAction(id: string) {
  return withAdminAction(async () => {
    const result = await coupons.deleteCoupon(id);
    if (result.ok) {
      revalidateCoupons();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "coupon_deleted",
            entityType: "coupon",
            entityId: id,
            diff: { id },
          },
          {
            type: "admin_action",
            title: "Admin deleted coupon",
            body: `Deleted coupon ${id}`,
            entityType: "coupon",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}
