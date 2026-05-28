import { NextResponse } from "next/server";
import { PayOS } from "@payos/node";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import {
  finalizePaidOrder,
  finalizePaidOrderByReference,
} from "@/lib/orders/finalize-paid-order";

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

// Stock + status update được xử lý tập trung ở lib/orders/finalize-paid-order

async function sendConfirmationEmail({
  to,
  customerName,
  orderId,
  totalAmount,
  paidAmount,
  remainingAmount,
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
      totalAmount: formatVnd(totalAmount),
      paidAmount: formatVnd(paidAmount),
      remainingAmount: formatVnd(remainingAmount),
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
      const orderCodeText = String(orderCode);
      const paymentPaidAt = new Date().toISOString();

      let finalizeResult = await finalizePaidOrderByReference({
        paymentReference: orderCodeText,
        paymentPaidAt,
      });

      if (!finalizeResult.ok) {
        finalizeResult = await finalizePaidOrder({
          orderId: orderCodeText,
          paymentReference: orderCodeText,
          paymentPaidAt,
        });
      }

      if (finalizeResult.ok && finalizeResult.order?.user_id) {
        const supabase = getSupabaseAdmin();
        const order = finalizeResult.order;
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
            totalAmount: Number(order.total_price) || 0,
            paidAmount: Number(order.deposit_amount) || 0,
            remainingAmount: Number(order.remaining_amount) || 0,
          });
        } catch (mailError) {
          console.error("[payos-webhook][send-mail-error]", mailError);
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
