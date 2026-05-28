import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type {
  CreateOrderInput,
  DbOrder,
  UpdateOrderInput,
} from "@/lib/supabase/types";
import { failure, success, type ActionResult } from "@/lib/admin/result";

function mapOrder(row: DbOrder): DbOrder {
  return {
    ...row,
    total_price: Number(row.total_price),
    subtotal: row.subtotal != null ? Number(row.subtotal) : null,
    discount_amount:
      row.discount_amount != null ? Number(row.discount_amount) : null,
  };
}

export async function listOrders(): Promise<ActionResult<DbOrder[]>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return failure(error.message);
  return success((data ?? []).map((row) => mapOrder(row as DbOrder)));
}

export async function getOrder(id: string): Promise<ActionResult<DbOrder>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return failure(error.message);
  return success(mapOrder(data as DbOrder));
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<ActionResult<DbOrder>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: input.user_id ?? null,
      total_price: input.total_price,
      subtotal: input.subtotal ?? input.total_price,
      discount_amount: input.discount_amount ?? 0,
      coupon_code: input.coupon_code ?? null,
      payment_method: input.payment_method ?? null,
      deposit_amount: input.deposit_amount ?? null,
      remaining_amount: input.remaining_amount ?? null,
      shipping_full_name: input.shipping_full_name ?? null,
      shipping_phone: input.shipping_phone ?? null,
      shipping_address: input.shipping_address ?? null,
      order_items: input.order_items ?? [],
      order_meta: input.order_meta ?? {},
      status: input.status ?? "pending",
    })
    .select("*")
    .single();

  if (error) return failure(error.message);
  return success(mapOrder(data as DbOrder));
}

export async function createOrdersBulk(
  inputs: CreateOrderInput[],
): Promise<ActionResult<DbOrder[]>> {
  if (inputs.length === 0) {
    return failure("Không có đơn hàng để import.");
  }

  const supabase = createAdminSupabaseClient();
  const payload = inputs.map((input) => ({
    user_id: input.user_id ?? null,
    total_price: input.total_price,
    subtotal: input.subtotal ?? input.total_price,
    discount_amount: input.discount_amount ?? 0,
    coupon_code: input.coupon_code ?? null,
    payment_method: input.payment_method ?? null,
    deposit_amount: input.deposit_amount ?? null,
    remaining_amount: input.remaining_amount ?? null,
    shipping_full_name: input.shipping_full_name ?? null,
    shipping_phone: input.shipping_phone ?? null,
    shipping_address: input.shipping_address ?? null,
    order_items: input.order_items ?? [],
    order_meta: input.order_meta ?? {},
    status: input.status ?? "pending",
  }));

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select("*");

  if (error) return failure(error.message);
  return success((data ?? []).map((row) => mapOrder(row as DbOrder)));
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput,
): Promise<ActionResult<DbOrder>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return failure(error.message);
  return success(mapOrder(data as DbOrder));
}

export async function deleteOrder(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) return failure(error.message);
  return success({ id });
}
