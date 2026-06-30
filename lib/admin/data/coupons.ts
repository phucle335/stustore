import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { normalizeCouponCode } from "@/lib/store/apply-coupon";
import type {
  CreateCouponInput,
  DbCoupon,
  UpdateCouponInput,
} from "@/lib/supabase/types";
import { failure, success, type ActionResult } from "@/lib/admin/result";

function mapCoupon(row: DbCoupon): DbCoupon {
  return {
    ...row,
    discount_value: Number(row.discount_value),
    min_order_amount: Number(row.min_order_amount),
    used_count: Number(row.used_count),
    max_uses: row.max_uses == null ? null : Number(row.max_uses),
  };
}

export async function listCoupons(): Promise<ActionResult<DbCoupon[]>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return failure(error.message);
  return success((data ?? []).map((row) => mapCoupon(row as DbCoupon)));
}

export async function createCoupon(
  input: CreateCouponInput,
): Promise<ActionResult<DbCoupon>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: normalizeCouponCode(input.code),
      description: input.description ?? null,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      min_order_amount: input.min_order_amount ?? 0,
      max_uses: input.max_uses ?? null,
      is_active: input.is_active ?? true,
      expires_at: input.expires_at ?? null,
    })
    .select("*")
    .single();

  if (error) return failure(error.message);
  return success(mapCoupon(data as DbCoupon));
}

export async function updateCoupon(
  id: string,
  input: UpdateCouponInput,
): Promise<ActionResult<DbCoupon>> {
  const supabase = createAdminSupabaseClient();
  const patch: Record<string, unknown> = { ...input };
  if (input.code) patch.code = normalizeCouponCode(input.code);

  const { data, error } = await supabase
    .from("coupons")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return failure(error.message);
  return success(mapCoupon(data as DbCoupon));
}

export async function deleteCoupon(id: string): Promise<ActionResult<null>> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return failure(error.message);
  return success(null);
}

export async function getCouponByCode(
  code: string,
): Promise<ActionResult<DbCoupon>> {
  const supabase = createAdminSupabaseClient();
  const normalized = normalizeCouponCode(code);
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (error) return failure(error.message);
  if (!data) return failure("Coupon code does not exist.");
  return success(mapCoupon(data as DbCoupon));
}

export async function incrementCouponUsage(
  code: string,
): Promise<ActionResult<null>> {
  const supabase = createAdminSupabaseClient();
  const normalized = normalizeCouponCode(code);
  const current = await getCouponByCode(normalized);
  if (!current.ok) return current;

  const { error } = await supabase
    .from("coupons")
    .update({ used_count: current.data.used_count + 1 })
    .eq("code", normalized);

  if (error) return failure(error.message);
  return success(null);
}
