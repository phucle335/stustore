import { createClient } from "@supabase/supabase-js";
import { isCategoryWithoutSizes } from "@/lib/store/product-category-rules";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase server env vars");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function normalizeOrderItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      product_id: String(item?.product_id ?? "").trim(),
      size:
        item?.size == null || String(item.size).trim() === ""
          ? null
          : String(item.size).trim(),
      quantity: Math.max(0, Number(item?.quantity) || 0),
    }))
    .filter((item) => item.product_id && item.quantity > 0);
}

function normalizeDbSizeRows(raw) {
  if (!Array.isArray(raw)) {
    if (typeof raw === "string" && raw.trim()) {
      try {
        return normalizeDbSizeRows(JSON.parse(raw));
      } catch {
        return [];
      }
    }
    return [];
  }

  return raw.map((entry) => {
    const row = entry ?? {};
    const sizeValue = row?.size;
    const size =
      sizeValue === null || sizeValue === undefined ? null : String(sizeValue).trim();
    return {
      size: size === "" ? null : size,
      quantity: Math.max(0, Number(row?.quantity) || 0),
    };
  });
}

async function deductStockForOrderItems(supabaseAdmin, orderItems) {
  const grouped = new Map();
  for (const item of orderItems) {
    const key = `${item.product_id}::${item.size ?? ""}`;
    const existing = grouped.get(key) ?? { ...item, quantity: 0 };
    existing.quantity += item.quantity;
    grouped.set(key, existing);
  }

  for (const item of grouped.values()) {
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, category, sizes")
      .eq("id", item.product_id)
      .maybeSingle();

    if (productError || !product) {
      console.error("[finalize-paid-order][stock-load-error]", productError);
      continue;
    }

    const category = product.category ? String(product.category) : "";
    const rawRows = normalizeDbSizeRows(product.sizes);
    if (rawRows.length === 0) {
      console.error("[finalize-paid-order][stock-empty-sizes]", {
        productId: item.product_id,
        category,
      });
      continue;
    }

    let nextRows = rawRows.map((row) => ({ ...row }));

    if (isCategoryWithoutSizes(category)) {
      const target = nextRows.find((row) => row.size == null);
      if (!target) {
        console.error("[finalize-paid-order][stock-no-nosize-row]", {
          productId: item.product_id,
          category,
        });
        continue;
      }
      target.quantity = Math.max(0, (Number(target.quantity) || 0) - item.quantity);
    } else if (item.size) {
      const target = nextRows.find((row) => String(row.size ?? "") === item.size);
      if (!target) {
        console.error("[finalize-paid-order][stock-size-not-found]", {
          productId: item.product_id,
          size: item.size,
        });
        const fallback = nextRows[0];
        fallback.quantity = Math.max(0, (Number(fallback.quantity) || 0) - item.quantity);
      } else {
        target.quantity = Math.max(0, (Number(target.quantity) || 0) - item.quantity);
      }
    } else {
      const noSize = nextRows.find((row) => row.size == null);
      if (noSize) {
        noSize.quantity = Math.max(0, (Number(noSize.quantity) || 0) - item.quantity);
      } else {
        const fallback = nextRows[0];
        fallback.quantity = Math.max(0, (Number(fallback.quantity) || 0) - item.quantity);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({ sizes: nextRows })
      .eq("id", item.product_id);
    if (updateError) {
      console.error("[finalize-paid-order][stock-update-error]", updateError);
    }
  }
}

async function finalizePaidOrderRow({
  supabaseAdmin,
  order,
  paymentReference,
  paymentPaidAt,
}) {
  await deductStockForOrderItems(
    supabaseAdmin,
    normalizeOrderItems(order.order_items),
  );

  return {
    ok: true,
    order: {
      ...order,
      status: "deposit_paid",
      payment_gateway: "payos",
      payment_reference: paymentReference ?? order.payment_reference,
      payment_paid_at: paymentPaidAt,
    },
  };
}

export async function finalizePaidOrder({
  orderId,
  paymentReference,
  paymentPaidAt = new Date().toISOString(),
}) {
  const supabaseAdmin = getSupabaseAdmin();

  const patch = {
    status: "deposit_paid",
    payment_gateway: "payos",
    ...(paymentReference ? { payment_reference: String(paymentReference) } : {}),
    payment_paid_at: paymentPaidAt,
  };

  const update = await supabaseAdmin
    .from("orders")
    .update(patch)
    .eq("id", String(orderId))
    .eq("status", "pending_payment")
    .select(
      "id, user_id, status, payment_reference, payment_method, is_preorder, total_price, deposit_amount, remaining_amount, shipping_full_name, order_items",
    );

  if (update.error) {
    throw update.error;
  }

  if ((update.data ?? []).length > 0) {
    return finalizePaidOrderRow({
      supabaseAdmin,
      order: update.data[0],
      paymentReference: paymentReference ? String(paymentReference) : null,
      paymentPaidAt,
    });
  }

  const { data: existing, error: loadError } = await supabaseAdmin
    .from("orders")
    .select(
      "id, user_id, status, payment_reference, payment_method, is_preorder, total_price, deposit_amount, remaining_amount, shipping_full_name, order_items",
    )
    .eq("id", String(orderId))
    .maybeSingle();

  if (loadError || !existing) {
    return { ok: false, error: loadError?.message || "Order not found" };
  }

  if (existing.status !== "deposit_paid" && existing.status !== "payment_verified") {
    return { ok: false, error: "Order is not paid yet", order: existing };
  }

  return { ok: true, order: existing };
}

export async function finalizePaidOrderByReference({
  paymentReference,
  paymentPaidAt = new Date().toISOString(),
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const ref = String(paymentReference ?? "").trim();
  if (!ref) return { ok: false, error: "Missing paymentReference" };

  const patch = {
    status: "deposit_paid",
    payment_gateway: "payos",
    payment_reference: ref,
    payment_paid_at: paymentPaidAt,
  };

  const update = await supabaseAdmin
    .from("orders")
    .update(patch)
    .eq("payment_reference", ref)
    .eq("status", "pending_payment")
    .select(
      "id, user_id, status, payment_reference, payment_method, is_preorder, total_price, deposit_amount, remaining_amount, shipping_full_name, order_items",
    );

  if (update.error) {
    throw update.error;
  }

  if ((update.data ?? []).length > 0) {
    return finalizePaidOrderRow({
      supabaseAdmin,
      order: update.data[0],
      paymentReference: ref,
      paymentPaidAt,
    });
  }

  return { ok: false, error: "No pending order found for reference" };
}

