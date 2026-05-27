import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/account/require-user";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import type { DbOrder } from "@/lib/supabase/types";

function parseOrderItems(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET() {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createAuthServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (data ?? []).map((row) => ({
    ...(row as DbOrder),
    total_price: Number((row as DbOrder).total_price),
    subtotal: row.subtotal != null ? Number(row.subtotal) : null,
    discount_amount:
      row.discount_amount != null ? Number(row.discount_amount) : null,
    order_items: parseOrderItems((row as DbOrder).order_items),
  }));

  return NextResponse.json({ data: orders });
}
