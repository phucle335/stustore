import { NextResponse } from "next/server";
import { PayOS } from "@payos/node";
import { requireAuthUser } from "@/lib/account/require-user";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

function normalizeDescription(input = "") {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 25);
}

function getPayOS() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("Missing PayOS env vars");
  }

  return new PayOS(clientId, apiKey, checksumKey);
}

export async function POST(request) {
  try {
    const auth = await requireAuthUser();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.user;
    const body = await request.json();
    const rawOrderId = String(body?.orderId ?? "").trim();

    if (!rawOrderId) {
      return NextResponse.json({ error: "orderId không hợp lệ." }, { status: 400 });
    }

    const orderCode = Number(rawOrderId);
    if (!Number.isInteger(orderCode) || orderCode <= 0) {
      return NextResponse.json(
        {
          error:
            "orderId phải là số nguyên dương để tương thích PayOS orderCode.",
        },
        { status: 400 },
      );
    }

    const supabase = await createAuthServerClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, user_id, total_price, deposit_amount, payment_method, is_preorder",
      )
      .eq("id", rawOrderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || "Không tìm thấy đơn hàng." },
        { status: 404 },
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền tạo link cho đơn hàng này." },
        { status: 403 },
      );
    }

    const total = Number(order.total_price) || 0;
    const computedDeposit = order.is_preorder
      ? Math.round(total * 0.5)
      : order.payment_method === "cod_deposit"
        ? Math.min(100000, total)
        : total;
    const depositAmount = Number(order.deposit_amount ?? computedDeposit);
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: "Số tiền cọc của đơn hàng không hợp lệ." },
        { status: 400 },
      );
    }

    const description = normalizeDescription(
      body?.description || `COC DON HANG ${orderCode}`,
    );
    const payos = getPayOS();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const paymentData = {
      orderCode,
      amount: Math.round(depositAmount),
      description,
      returnUrl: `${siteUrl}/checkout/success`,
      cancelUrl: `${siteUrl}/checkout/cancel`,
    };

    const result = await payos.createPaymentLink(paymentData);

    return NextResponse.json({
      checkoutUrl: result?.checkoutUrl || null,
      data: result,
    });
  } catch (error) {
    console.error("[create-payment-link]", error);
    return NextResponse.json(
      { error: "Không thể tạo link thanh toán PayOS." },
      { status: 500 },
    );
  }
}
