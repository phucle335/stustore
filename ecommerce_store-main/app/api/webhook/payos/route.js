import { NextResponse } from "next/server";
import { PayOS } from "@payos/node";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";

function getPayOS() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("Missing PayOS env vars");
  }

  return new PayOS({ clientId, apiKey, checksumKey });
}

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

function getMailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function formatVnd(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString("vi-VN")}đ`;
}

function normalizeOrderItems(raw) {
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

async function deductStockForOrder(supabase, orderItems) {
  const grouped = new Map();
  for (const item of orderItems) {
    const key = `${item.product_id}::${item.size ?? ""}`;
    const existing = grouped.get(key) ?? { ...item, quantity: 0 };
    existing.quantity += item.quantity;
    grouped.set(key, existing);
  }

  for (const item of grouped.values()) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, sizes")
      .eq("id", item.product_id)
      .maybeSingle();

    if (productError || !product) {
      console.error("[payos-webhook][stock-load-error]", productError);
      continue;
    }

    const rawSizes = Array.isArray(product.sizes) ? product.sizes : [];
    if (rawSizes.length === 0) continue;

    const nextSizes = rawSizes.map((row) => ({
      size: row?.size ?? null,
      quantity: Math.max(0, Number(row?.quantity) || 0),
    }));

    let updated = false;
    if (item.size) {
      const target = nextSizes.find((row) => String(row.size ?? "") === item.size);
      if (target) {
        target.quantity = Math.max(0, target.quantity - item.quantity);
        updated = true;
      }
    } else {
      const noSize = nextSizes.find((row) => row.size == null || row.size === "");
      if (noSize) {
        noSize.quantity = Math.max(0, noSize.quantity - item.quantity);
        updated = true;
      }
    }

    if (!updated) {
      const fallback = nextSizes[0];
      fallback.quantity = Math.max(0, fallback.quantity - item.quantity);
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ sizes: nextSizes })
      .eq("id", item.product_id);
    if (updateError) {
      console.error("[payos-webhook][stock-update-error]", updateError);
    }
  }
}

async function sendConfirmationEmail({
  to,
  customerName,
  orderId,
  paidAmount,
}) {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn("[payos-webhook][mail-skip] Missing Gmail transporter config.");
    return;
  }
  if (!to) {
    console.warn("[payos-webhook][mail-skip] Missing recipient email.");
    return;
  }

  const historyUrl = `${(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/+$/, "")}/tai-khoan`;

  const html = await render(
    OrderConfirmationEmail({
      customerName,
      orderId,
      paidAmount: formatVnd(paidAmount),
      historyUrl,
    }),
  );

  await transporter.sendMail({
    from: `"STUSPORT" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Xác nhận đặt hàng & Thanh toán thành công",
    html,
  });
}

async function resolveCustomerEmail(supabase, userId) {
  if (!userId) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (userRow?.email) {
    return userRow.email;
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.getUserById(userId);
  if (authError) {
    console.error("[payos-webhook][auth-user-error]", authError);
    return null;
  }

  return authData?.user?.email ?? null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const payos = getPayOS();

    const verifiedData = await payos.webhooks.verify(body);

    const webhookCode = String(
      body?.code ?? verifiedData?.code ?? body?.data?.code ?? "",
    );
    const orderCode = verifiedData?.orderCode ?? body?.data?.orderCode;

    if (!orderCode) {
      return NextResponse.json({ ok: true, message: "No orderCode" });
    }

    if (webhookCode === "00" || body?.success === true) {
      const supabase = getSupabaseAdmin();
      const orderCodeText = String(orderCode);

      const patch = {
        status: "deposit_paid",
        payment_gateway: "payos",
        payment_reference: orderCodeText,
        payment_paid_at: new Date().toISOString(),
      };

      const updateByReference = await supabase
        .from("orders")
        .update(patch)
        .eq("payment_reference", orderCodeText)
        .eq("status", "pending_payment")
        .select("id, user_id, shipping_full_name, total_price, order_items");

      const { data: updatedByReference, error: referenceError } =
        updateByReference;
      if (referenceError) {
        console.error("[payos-webhook][supabase-update-error]", referenceError);
        return NextResponse.json(
          { error: "Webhook verified nhưng update đơn thất bại." },
          { status: 500 },
        );
      }

      if ((updatedByReference ?? []).length > 0) {
        const order = updatedByReference[0];
        await deductStockForOrder(supabase, normalizeOrderItems(order.order_items));
        if (order?.user_id) {
          const { data: userRow } = await supabase
            .from("users")
            .select("full_name")
            .eq("id", order.user_id)
            .maybeSingle();
          const email = await resolveCustomerEmail(supabase, order.user_id);

          try {
            await sendConfirmationEmail({
              to: email,
              customerName:
                order.shipping_full_name || userRow?.full_name || "Bạn",
              orderId: order.id,
              paidAmount: Number(order.total_price) || 0,
            });
          } catch (mailError) {
            console.error("[payos-webhook][send-mail-error]", mailError);
          }
        }
        return NextResponse.json({ ok: true, message: "Webhook processed" });
      }

      const { data: updatedById, error } = await supabase
        .from("orders")
        .update(patch)
        .eq("id", orderCodeText)
        .eq("status", "pending_payment")
        .select("id, user_id, shipping_full_name, total_price, order_items");

      if (error) {
        console.error("[payos-webhook][supabase-update-error]", error);
        return NextResponse.json(
          { error: "Webhook verified nhưng update đơn thất bại." },
          { status: 500 },
        );
      }

      if ((updatedById ?? []).length > 0) {
        const order = updatedById[0];
        await deductStockForOrder(supabase, normalizeOrderItems(order.order_items));
        if (order?.user_id) {
          const { data: userRow } = await supabase
            .from("users")
            .select("full_name")
            .eq("id", order.user_id)
            .maybeSingle();
          const email = await resolveCustomerEmail(supabase, order.user_id);

          try {
            await sendConfirmationEmail({
              to: email,
              customerName:
                order.shipping_full_name || userRow?.full_name || "Bạn",
              orderId: order.id,
              paidAmount: Number(order.total_price) || 0,
            });
          } catch (mailError) {
            console.error("[payos-webhook][send-mail-error]", mailError);
          }
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Webhook processed" });
  } catch (error) {
    console.error("[payos-webhook]", error);
    return NextResponse.json(
      { error: "Webhook PayOS không hợp lệ hoặc lỗi hệ thống." },
      { status: 500 },
    );
  }
}
