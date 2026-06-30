"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getTierFromPoints, type MemberTier } from "./points";

export type PointsActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function issueWelcomeCouponForNewUser(
  userId: string,
): Promise<PointsActionResult<{ couponCode: string }>> {
  const supabase = await createAdminSupabaseClient();

  const { data: couponRow, error: couponError } = await supabase
    .from("coupons")
    .select("id, code")
    .eq("code", "WELCOME100")
    .maybeSingle();

  if (couponError || !couponRow) {
    return { ok: false, error: couponError?.message ?? "Welcome coupon not found." };
  }

  const { error: insertError } = await supabase
    .from("user_coupons")
    .upsert(
      {
        user_id: userId,
        coupon_id: couponRow.id,
        status: "available",
      },
      { onConflict: "user_id,coupon_id" },
    );

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  return { ok: true, data: { couponCode: couponRow.code } };
}

export async function checkAndIssueRewardCoupon(
  userId: string,
  oldTier: MemberTier,
  newTier: MemberTier,
): Promise<PointsActionResult<{ couponCode: string } | null>> {
  if (oldTier === newTier) {
    return { ok: true, data: null };
  }

  const supabase = await createAdminSupabaseClient();
  const targetCouponCode =
    newTier === "Member" ? "MEMBER10" : newTier === "Elite" ? "ELITE15" : null;

  if (!targetCouponCode) {
    return { ok: true, data: null };
  }

  const { data: couponRow, error: couponError } = await supabase
    .from("coupons")
    .select("id, code")
    .eq("code", targetCouponCode)
    .maybeSingle();

  if (couponError || !couponRow) {
    return { ok: false, error: couponError?.message ?? "Reward coupon not found." };
  }

  const { error: insertError } = await supabase
    .from("user_coupons")
    .upsert(
      {
        user_id: userId,
        coupon_id: couponRow.id,
        status: "available",
      },
      { onConflict: "user_id,coupon_id" },
    );

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  return { ok: true, data: { couponCode: couponRow.code } };
}

export async function awardPointsForOrder(
  userId: string,
  orderId: string,
  subtotal: number,
): Promise<PointsActionResult<{ points: number; tier: MemberTier }>> {
  const supabase = await createAdminSupabaseClient();

  const existing = await supabase
    .from("member_points_history")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing.error) {
    return { ok: false, error: existing.error.message };
  }

  if (existing.data) {
    return { ok: true, data: { points: 0, tier: "Starter" } };
  }

  const points = Math.max(0, Math.floor(subtotal / 60_000));
  if (points <= 0) {
    return { ok: true, data: { points: 0, tier: "Starter" } };
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("stu_points, membership_tier")
    .eq("id", userId)
    .maybeSingle();

  if (userError || !userRow) {
    return { ok: false, error: userError?.message ?? "User not found." };
  }

  const currentPoints = Number(userRow.stu_points ?? 0);
  const nextPoints = currentPoints + points;
  const oldTier = (userRow.membership_tier as MemberTier) ?? "Starter";
  const newTier = getTierFromPoints(nextPoints);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      stu_points: nextPoints,
      membership_tier: newTier,
    })
    .eq("id", userId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const { error: historyError } = await supabase
    .from("member_points_history")
    .insert({
      user_id: userId,
      order_id: orderId,
      points,
      type: "earned",
      description: `Points earned from order`,
    });

  if (historyError) {
    return { ok: false, error: historyError.message };
  }

  if (oldTier !== newTier) {
    const rewardResult = await checkAndIssueRewardCoupon(userId, oldTier, newTier);
    if (!rewardResult.ok) {
      return rewardResult;
    }
  }

  return { ok: true, data: { points, tier: newTier } };
}
