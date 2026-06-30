"use server";

import { revalidatePath } from "next/cache";
import { requireAuthUser } from "@/lib/account/require-user";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type {
  DbMemberPointsHistory,
  MemberTier,
  PointsHistoryType,
  UserCouponStatus,
} from "@/lib/supabase/types";
import { getTierFromPoints, calculatePointsFromOrder } from "./points";

export type MemberPointsHistoryRow = DbMemberPointsHistory & {
  coupon_code?: string | null;
};

type PointsActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ACCOUNT_PATH = "/tai-khoan";
const ADMIN_PATH = "/admin";

function revalidateAccount() {
  revalidatePath(ACCOUNT_PATH);
}

function revalidateAdmin() {
  revalidatePath(ADMIN_PATH);
}

export async function getMyPointsAction(): Promise<
  PointsActionResult<{ points: number; tier: MemberTier }>
> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("stu_points, membership_tier")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Unable to load points." };
  }

  return {
    ok: true,
    data: {
      points: Number(data.stu_points ?? 0),
      tier: (data.membership_tier ?? "Starter") as MemberTier,
    },
  };
}

export async function getMyPointsHistoryAction(): Promise<
  PointsActionResult<MemberPointsHistoryRow[]>
> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("member_points_history")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    data: (data ?? []) as MemberPointsHistoryRow[],
  };
}

export async function getMembersAction(params?: {
  search?: string;
  tier?: MemberTier | "all";
}): Promise<PointsActionResult<MemberPointsHistoryRow[]>> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();
  let query = supabase
    .from("users")
    .select(
      "id, email, full_name, stu_points, membership_tier, created_at, updated_at",
    )
    .order("stu_points", { ascending: false });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `email.ilike.${term},full_name.ilike.${term}`,
    );
  }

  if (params?.tier && params.tier !== "all") {
    query = query.eq("membership_tier", params.tier);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    data: (data ?? []) as MemberPointsHistoryRow[],
  };
}

export async function getMemberHistoryAction(
  userId: string,
): Promise<PointsActionResult<MemberPointsHistoryRow[]>> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("member_points_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    data: (data ?? []) as MemberPointsHistoryRow[],
  };
}

export async function adjustMemberPointsAction(
  userId: string,
  points: number,
  type: PointsHistoryType,
  description?: string,
): Promise<PointsActionResult<{ points: number; tier: MemberTier }>> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  if (!Number.isFinite(points) || points === 0) {
    return { ok: false, error: "Points must be a non-zero number." };
  }

  const supabase = await createAdminSupabaseClient();

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("stu_points, membership_tier")
    .eq("id", userId)
    .maybeSingle();

  if (userError || !userRow) {
    return { ok: false, error: userError?.message ?? "User not found." };
  }

  const currentPoints = Number(userRow.stu_points ?? 0);
  const nextPoints = Math.max(0, currentPoints + points);
  const nextTier = getTierFromPoints(nextPoints);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      stu_points: nextPoints,
      membership_tier: nextTier,
    })
    .eq("id", userId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const { error: historyError } = await supabase
    .from("member_points_history")
    .insert({
      user_id: userId,
      points: Math.abs(points),
      type,
      description: description ?? null,
      order_id: null,
    });

  if (historyError) {
    return { ok: false, error: historyError.message };
  }

  revalidateAdmin();
  revalidateAccount();

  return {
    ok: true,
    data: { points: nextPoints, tier: nextTier },
  };
}

export async function updateMemberTierAction(
  userId: string,
  tier: MemberTier,
): Promise<PointsActionResult<{ tier: MemberTier }>> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();

  const { error } = await supabase
    .from("users")
    .update({ membership_tier: tier })
    .eq("id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAdmin();
  revalidateAccount();

  return { ok: true, data: { tier } };
}

export async function getMyUserCouponsAction(
  status?: UserCouponStatus,
): Promise<
  PointsActionResult<
    {
      id: string;
      coupon_code: string;
      description: string | null;
      discount_type: "percent" | "fixed";
      discount_value: number;
      min_order_amount: number;
      expires_at: string | null;
      issued_at: string;
      used_at: string | null;
      status: UserCouponStatus;
    }[]
  >
> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();
  let query = supabase
    .from("user_coupons")
    .select(
      `
      id,
      status,
      issued_at,
      used_at,
      coupon:coupons (
        code,
        description,
        discount_type,
        discount_value,
        min_order_amount,
        expires_at
      )
    `,
    )
    .eq("user_id", auth.user.id)
    .order("issued_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  const rows =
    data?.map((row: Record<string, unknown>) => {
      const coupon = row.coupon as Record<string, unknown> | null;
      return {
        id: String(row.id),
        coupon_code: String(coupon?.code ?? ""),
        description: (coupon?.description as string | null) ?? null,
        discount_type: (coupon?.discount_type as
          | "percent"
          | "fixed") ?? "fixed",
        discount_value: Number(coupon?.discount_value ?? 0),
        min_order_amount: Number(coupon?.min_order_amount ?? 0),
        expires_at: (coupon?.expires_at as string | null) ?? null,
        issued_at: String(row.issued_at),
        used_at: (row.used_at as string | null) ?? null,
        status: row.status as UserCouponStatus,
      };
    }) ?? [];

  return { ok: true, data: rows };
}

export async function markMemberCouponUsedAction(
  userCouponId: string,
): Promise<PointsActionResult<{ status: UserCouponStatus }>> {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const supabase = await createAdminSupabaseClient();

  const { error } = await supabase
    .from("user_coupons")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
    })
    .eq("id", userCouponId)
    .eq("user_id", auth.user.id)
    .eq("status", "available");

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateAccount();
  return { ok: true, data: { status: "used" } };
}
