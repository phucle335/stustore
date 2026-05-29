import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import { createClient } from "@supabase/supabase-js";

const PAID_STATUSES = new Set(["deposit_paid", "payment_verified"]);

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
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function formatVnd(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString("vi-VN")}đ`;
}

async function resolveCustomerEmail(supabase, userId) {
  if (!userId) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (userRow?.email) return userRow.email;

  const { data: authData, error: authError } =
    await supabase.auth.admin.getUserById(userId);
  if (authError) {
    console.error("[order-email][auth-user-error]", authError);
    return null;
  }
  return authData?.user?.email ?? null;
}

async function sendConfirmationEmail({
  to,
  customerName,
  orderId,
  totalAmount,
  paidAmount,
  remainingAmount,
  items,
}) {
  const transporter = getMailTransporter();
  if (!transporter) {
    console.warn("[order-email][mail-skip] Missing GMAIL_USER / GMAIL_APP_PASSWORD.");
    return { ok: false, reason: "missing_gmail_config" };
  }
  if (!to) {
    console.warn("[order-email][mail-skip] Missing recipient email.");
    return { ok: false, reason: "missing_recipient" };
  }

  const historyUrl = `${(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/+$/, "")}/tai-khoan`;

  const html = await render(
    OrderConfirmationEmail({
      customerName,
      orderId,
      totalAmount: formatVnd(totalAmount),
      paidAmount: formatVnd(paidAmount),
      remainingAmount: formatVnd(remainingAmount),
      items: Array.isArray(items) ? items : [],
      historyUrl,
    }),
  );

  await transporter.sendMail({
    from: `"STUSPORT" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Xác nhận đặt hàng & Thanh toán thành công",
    html,
  });

  return { ok: true };
}

const ORDER_SELECT_FULL =
  "id, user_id, status, total_price, deposit_amount, remaining_amount, shipping_full_name, order_items, confirmation_email_sent_at";

const ORDER_SELECT_BASE =
  "id, user_id, status, total_price, deposit_amount, remaining_amount, shipping_full_name, order_items";

async function loadOrderForEmail(supabase, id) {
  const full = await supabase.from("orders").select(ORDER_SELECT_FULL).eq("id", id).maybeSingle();
  if (!full.error) return full;

  if (/confirmation_email_sent_at|column/i.test(full.error.message ?? "")) {
    return supabase.from("orders").select(ORDER_SELECT_BASE).eq("id", id).maybeSingle();
  }
  return full;
}

/**
 * Gửi email xác nhận một lần cho đơn đã thanh toán (idempotent).
 */
export async function maybeSendOrderConfirmationEmail(orderId, supabaseAdmin) {
  const supabase = supabaseAdmin ?? getSupabaseAdmin();
  const id = String(orderId ?? "").trim();
  if (!id) return { sent: false, reason: "missing_order_id" };

  const { data: order, error } = await loadOrderForEmail(supabase, id);

  if (error || !order) {
    console.error("[order-email][load-error]", error);
    return { sent: false, reason: "order_not_found" };
  }

  if (!PAID_STATUSES.has(String(order.status ?? ""))) {
    return { sent: false, reason: "order_not_paid" };
  }

  if (order.confirmation_email_sent_at) {
    return { sent: false, reason: "already_sent" };
  }

  if (!order.user_id) {
    return { sent: false, reason: "no_user_id" };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", order.user_id)
    .maybeSingle();

  const email = await resolveCustomerEmail(supabase, order.user_id);
  if (!email) {
    return { sent: false, reason: "no_email" };
  }

  try {
    const result = await sendConfirmationEmail({
      to: email,
      customerName: order.shipping_full_name || userRow?.full_name || "Bạn",
      orderId: order.id,
      totalAmount: Number(order.total_price) || 0,
      paidAmount: Number(order.deposit_amount) || 0,
      remainingAmount: Number(order.remaining_amount) || 0,
      items: Array.isArray(order.order_items) ? order.order_items : [],
    });

    if (!result.ok) {
      return { sent: false, reason: result.reason };
    }

    const { error: markError } = await supabase
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", id);

    if (markError && !/confirmation_email_sent_at|column/i.test(markError.message ?? "")) {
      console.warn("[order-email][mark-sent-error]", markError.message);
    }

    return { sent: true };
  } catch (mailError) {
    console.error("[order-email][send-error]", mailError);
    return { sent: false, reason: "send_failed" };
  }
}
