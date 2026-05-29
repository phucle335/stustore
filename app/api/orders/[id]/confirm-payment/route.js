import { NextResponse } from "next/server";
import { PayOS } from "@payos/node";
import { requireAuthUser } from "@/lib/account/require-user";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { finalizePaidOrder } from "@/lib/orders/finalize-paid-order";
import { maybeSendOrderConfirmationEmail } from "@/lib/orders/send-order-confirmation-email";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(_request, context) {
  try {
    const auth = await requireAuthUser();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orderId = String(context?.params?.id ?? "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId không hợp lệ." }, { status: 400 });
    }

    const supabase = await createAuthServerClient();
    const { data: order, error: loadError } = await supabase
      .from("orders")
      .select("id, user_id, status, payment_reference")
      .eq("id", orderId)
      .maybeSingle();

    if (loadError || !order) {
      return NextResponse.json(
        { error: loadError?.message || "Không tìm thấy đơn hàng." },
        { status: 404 },
      );
    }

    if (order.user_id !== auth.user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền xác nhận đơn hàng này." },
        { status: 403 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (order.status === "deposit_paid" || order.status === "payment_verified") {
      const mail = await maybeSendOrderConfirmationEmail(order.id, supabaseAdmin);
      return NextResponse.json({
        ok: true,
        status: order.status,
        orderId: order.id,
        emailSent: mail.sent,
      });
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Đơn hàng không còn ở trạng thái chờ thanh toán." },
        { status: 400 },
      );
    }

    const orderCode = Number(order.payment_reference ?? order.id);
    if (!Number.isInteger(orderCode) || orderCode <= 0) {
      return NextResponse.json(
        { error: "payment_reference của đơn hàng không hợp lệ." },
        { status: 400 },
      );
    }

    const payos = getPayOS();
    const link = await payos.paymentRequests.get(orderCode);

    if (link?.status !== "PAID") {
      return NextResponse.json(
        { ok: false, status: link?.status ?? "UNKNOWN" },
        { status: 409 },
      );
    }

    const finalizeResult = await finalizePaidOrder({
      orderId: order.id,
      paymentReference: String(orderCode),
      paymentPaidAt: new Date().toISOString(),
    });

    if (!finalizeResult.ok) {
      return NextResponse.json(
        { ok: false, error: finalizeResult.error || "Không thể cập nhật đơn hàng." },
        { status: 500 },
      );
    }

    const mail = await maybeSendOrderConfirmationEmail(
      finalizeResult.order?.id ?? order.id,
      supabaseAdmin,
    );

    return NextResponse.json({
      ok: true,
      status: finalizeResult.order?.status ?? "deposit_paid",
      orderId: finalizeResult.order?.id ?? order.id,
      emailSent: mail.sent,
    });
  } catch (error) {
    console.error("[confirm-payment]", error);
    return NextResponse.json(
      { error: "Không thể xác nhận thanh toán." },
      { status: 500 },
    );
  }
}
