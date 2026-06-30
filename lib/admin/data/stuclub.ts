import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type {
  DbMemberPointsHistory,
  DbUserCoupon,
  DbUser,
  MemberTier,
  PointsHistoryType,
  UserCouponStatus,
} from "@/lib/supabase/types";
import { failure, success, type ActionResult } from "@/lib/admin/result";

function mapUser(row: DbUser & { full_name?: string | null; email?: string | null }) {
  return {
    id: String(row.id),
    email: row.email ?? null,
    full_name: row.full_name ?? null,
    membership_tier: (row.membership_tier ?? "Starter") as MemberTier,
    stu_points: Number(row.stu_points ?? 0),
  };
}

function mapHistory(row: DbMemberPointsHistory & { orders?: { id: string } | null }) {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    order_id: row.order_id ?? null,
    order_ref: row.orders?.id ?? null,
    points: Number(row.points),
    type: row.type as PointsHistoryType,
    description: row.description ?? null,
    created_at: row.created_at,
  };
}

function mapUserCoupon(
  row: DbUserCoupon & {
    coupons?: {
      id: string;
      code: string;
      description: string | null;
      discount_type: string;
      discount_value: number;
      min_order_amount: number;
      expires_at: string | null;
    } | null;
  },
) {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    coupon_id: String(row.coupon_id),
    code: row.coupons?.code ?? "",
    description: row.coupons?.description ?? null,
    discount_type: row.coupons?.discount_type ?? "fixed",
    discount_value: Number(row.coupons?.discount_value ?? 0),
    min_order_amount: Number(row.coupons?.min_order_amount ?? 0),
    expires_at: row.coupons?.expires_at ?? null,
    status: row.status as UserCouponStatus,
    issued_at: row.issued_at,
    used_at: row.used_at ?? null,
  };
}

export async function getStuclubStats(): Promise<
  ActionResult<{
    total_members: number;
    starter: number;
    member: number;
    elite: number;
    total_points_issued: number;
    total_coupons_used: number;
  }>
> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("membership_tier, stu_points")
    .neq("membership_tier", null);

  if (error) return failure(error.message);

  const rows = (data ?? []) as Array<{ membership_tier: string | null; stu_points: number | null }>;
  const totalMembers = rows.length;
  const counts = {
    starter: 0,
    member: 0,
    elite: 0,
  };

  let totalPointsIssued = 0;

  for (const row of rows) {
    const tier = (row.membership_tier ?? "Starter") as MemberTier;
    counts[tier.toLowerCase() as keyof typeof counts] += 1;
    totalPointsIssued += Number(row.stu_points ?? 0);
  }

  const { count: totalCouponsUsed, error: couponError } = await supabase
    .from("user_coupons")
    .select("*", { count: "exact", head: true })
    .eq("status", "used");

  if (couponError) return failure(couponError.message);

  return success({
    total_members: totalMembers,
    starter: counts.starter,
    member: counts.member,
    elite: counts.elite,
    total_points_issued: totalPointsIssued,
    total_coupons_used: totalCouponsUsed ?? 0,
  });
}

export async function getMembers(): Promise<ActionResult<Array<ReturnType<typeof mapUser>>>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, membership_tier, stu_points, created_at")
    .order("created_at", { ascending: false });

  if (error) return failure(error.message);
  return success((data ?? []).map((row) => mapUser(row as DbUser & { full_name?: string | null; email?: string | null })));
}

export async function getMemberDetails(
  userId: string,
): Promise<ActionResult<{ user: ReturnType<typeof mapUser>; history: Array<ReturnType<typeof mapHistory>>; coupons: Array<ReturnType<typeof mapUserCoupon>> }>> {
  const supabase = createAdminSupabaseClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, full_name, membership_tier, stu_points, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (userError) return failure(userError.message);
  if (!user) return failure("Member not found.");

  const { data: history, error: historyError } = await supabase
    .from("member_points_history")
    .select("*, orders(id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (historyError) return failure(historyError.message);

  const { data: coupons, error: couponsError } = await supabase
    .from("user_coupons")
    .select("*, coupons(code, description, discount_type, discount_value, min_order_amount, expires_at)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false })
    .limit(100);

  if (couponsError) return failure(couponsError.message);

  return success({
    user: mapUser(user as DbUser & { full_name?: string | null; email?: string | null }),
    history: (history ?? []).map((row) => mapHistory(row as DbMemberPointsHistory & { orders?: { id: string } | null })),
    coupons: (coupons ?? []).map((row) =>
      mapUserCoupon(
        row as DbUserCoupon & {
          coupons?: {
            id: string;
            code: string;
            description: string | null;
            discount_type: string;
            discount_value: number;
            min_order_amount: number;
            expires_at: string | null;
          } | null;
        },
      ),
    ),
  });
}

export async function adjustPoints(
  userId: string,
  points: number,
  type: PointsHistoryType,
  description: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();

  const { error: historyError } = await supabase.from("member_points_history").insert({
    user_id: userId,
    points,
    type,
    description,
  });

  if (historyError) return failure(historyError.message);

  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("stu_points")
    .eq("id", userId)
    .single();

  if (existingError || !existing) {
    return failure(existingError?.message ?? "Could not read current points.");
  }

  const currentPoints = Number(existing.stu_points ?? 0);
  const nextPoints = Math.max(0, currentPoints + points);

  const { data, error } = await supabase
    .from("users")
    .update({ stu_points: nextPoints })
    .eq("id", userId)
    .select("id")
    .single();

  if (error || !data) return failure(error?.message ?? "Could not update points.");

  return success({ id: String(data.id) });
}

export async function updateTier(
  userId: string,
  tier: MemberTier,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .update({ membership_tier: tier })
    .eq("id", userId)
    .select("id")
    .single();

  if (error || !data) return failure(error?.message ?? "Could not update tier.");

  return success({ id: String(data.id) });
}

export async function createCoupon(input: {
  code: string;
  description?: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  is_active?: boolean;
  expires_at?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();

  const normalizedCode = input.code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: normalizedCode,
      description: input.description ?? null,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      min_order_amount: input.min_order_amount ?? 0,
      max_uses: input.max_uses ?? null,
      is_active: input.is_active ?? true,
      expires_at: input.expires_at ?? null,
    })
    .select("id")
    .single();

  if (error || !data) return failure(error?.message ?? "Could not create coupon.");

  return success({ id: String(data.id) });
}

export async function assignCoupon(
  userId: string,
  couponId: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("user_coupons")
    .insert({
      user_id: userId,
      coupon_id: couponId,
      status: "available",
    })
    .select("id")
    .single();

  if (error || !data) return failure(error?.message ?? "Could not assign coupon.");

  return success({ id: String(data.id) });
}

export async function expireCoupon(
  userCouponId: string,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("user_coupons")
    .update({
      status: "expired",
      used_at: new Date().toISOString(),
    })
    .eq("id", userCouponId)
    .select("id")
    .single();

  if (error || !data) return failure(error?.message ?? "Could not expire coupon.");

  return success({ id: String(data.id) });
}

export async function getCouponStats(): Promise<
  ActionResult<{
    total_coupons: number;
    available: number;
    used: number;
    expired: number;
  }>
> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("user_coupons")
    .select("status")
    .limit(5000);

  if (error) return failure(error.message);

  const rows = (data ?? []) as Array<{ status: UserCouponStatus }>;
  const counts = { available: 0, used: 0, expired: 0 };

  for (const row of rows) {
    const key = row.status as keyof typeof counts;
    if (key in counts) counts[key] += 1;
  }

  return success({
    total_coupons: rows.length,
    ...counts,
  });
}
