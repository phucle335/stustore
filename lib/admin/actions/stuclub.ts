"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin, withAdminAction } from "@/lib/admin/auth";
import * as stuclub from "@/lib/admin/data/stuclub";
import type { MemberTier } from "@/lib/supabase/types";
import { logAdminAuditAndNotification } from "@/lib/admin/audit/log";

const ADMIN_PATH = "/admin";

function revalidateStuclub() {
  revalidatePath(`${ADMIN_PATH}/stuclub`);
  revalidatePath(ADMIN_PATH);
}

export async function getStuclubStatsAction() {
  return withAdminAction(() => stuclub.getStuclubStats());
}

export async function getMembersAction() {
  return withAdminAction(() => stuclub.getMembers());
}

export async function getMemberDetailsAction(userId: string) {
  return withAdminAction(() => stuclub.getMemberDetails(userId));
}

export async function adjustPointsAction(userId: string, points: number, type: "manual_add" | "manual_deduct", description: string) {
  return withAdminAction(async () => {
    const result = await stuclub.adjustPoints(userId, points, type, description);
    if (result.ok) {
      revalidateStuclub();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "stuclub_points_adjusted",
            entityType: "member_points_history",
            entityId: result.data.id,
            diff: { userId, points, type, description },
          },
          {
            type: "admin_action",
            title: "Adjusted member points",
            body: `Adjusted ${points} points for ${userId}`,
            entityType: "member_points_history",
            entityId: result.data.id,
          },
        );
      }
    }
    return result;
  });
}

export async function updateMemberTierAction(userId: string, tier: MemberTier) {
  return withAdminAction(async () => {
    const result = await stuclub.updateTier(userId, tier);
    if (result.ok) {
      revalidateStuclub();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "stuclub_tier_updated",
            entityType: "users",
            entityId: userId,
            diff: { tier },
          },
          {
            type: "admin_action",
            title: "Updated member tier",
            body: `Updated tier to ${tier} for ${userId}`,
            entityType: "users",
            entityId: userId,
          },
        );
      }
    }
    return result;
  });
}

export async function createMemberCouponAction(input: {
  userId: string;
  couponId: string;
}) {
  return withAdminAction(async () => {
    const result = await stuclub.assignCoupon(input.userId, input.couponId);
    if (result.ok) {
      revalidateStuclub();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "stuclub_coupon_assigned",
            entityType: "user_coupons",
            entityId: result.data.id,
            diff: input,
          },
          {
            type: "admin_action",
            title: "Assigned coupon to member",
            body: `Assigned coupon ${input.couponId} to ${input.userId}`,
            entityType: "user_coupons",
            entityId: result.data.id,
          },
        );
      }
    }
    return result;
  });
}

export async function expireMemberCouponAction(userCouponId: string) {
  return withAdminAction(async () => {
    const result = await stuclub.expireCoupon(userCouponId);
    if (result.ok) {
      revalidateStuclub();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "stuclub_coupon_expired",
            entityType: "user_coupons",
            entityId: userCouponId,
            diff: { userCouponId },
          },
          {
            type: "admin_action",
            title: "Expired member coupon",
            body: `Expired coupon ${userCouponId}`,
            entityType: "user_coupons",
            entityId: userCouponId,
          },
        );
      }
    }
    return result;
  });
}

export async function getCouponStatsAction() {
  return withAdminAction(() => stuclub.getCouponStats());
}
