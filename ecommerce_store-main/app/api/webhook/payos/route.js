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

async function sendConfirmationEmail({
  to,
  customerName,
  orderId,
  paidAmount,
}) {
  const transporter = getMailTransporter();
  if (!transporter || !to) {
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

export async function POST(request) {
  try {
    const body = await request.json();
    const payos = getPayOS();

    const verifiedData = await payos.webhooks.verify(body);

    const webhookCode = String(body?.code ?? verifiedData?.code ?? "");
    const orderCode = verifiedData?.orderCode ?? body?.data?.orderCode;

    if (!orderCode) {
      return NextResponse.json({ ok: true, message: "No orderCode" });
    }

    if (webhookCode === "00") {
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
        .select("id, user_id, shipping_full_name, total_price");

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
        if (order?.user_id) {
          const { data: userRow } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", order.user_id)
            .maybeSingle();

          try {
            await sendConfirmationEmail({
              to: userRow?.email ?? null,
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
        .select("id, user_id, shipping_full_name, total_price");

      if (error) {
        console.error("[payos-webhook][supabase-update-error]", error);
        return NextResponse.json(
          { error: "Webhook verified nhưng update đơn thất bại." },
          { status: 500 },
        );
      }

      if ((updatedById ?? []).length > 0) {
        const order = updatedById[0];
        if (order?.user_id) {
          const { data: userRow } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", order.user_id)
            .maybeSingle();

          try {
            await sendConfirmationEmail({
              to: userRow?.email ?? null,
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
