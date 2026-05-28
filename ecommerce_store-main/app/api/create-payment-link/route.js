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

  return new PayOS({ clientId, apiKey, checksumKey });
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown PayOS error";
}

function isDuplicateOrderCodeError(error) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("ordercode") ||
    message.includes("order code") ||
    message.includes("đã tồn tại") ||
    message.includes("already exists")
  );
}

async function createPayOSLink(payos, paymentData) {
  try {
    return await payos.paymentRequests.create(paymentData);
  } catch (error) {
    if (!isDuplicateOrderCodeError(error)) {
      throw error;
    }

    await payos.paymentRequests.cancel(
      paymentData.orderCode,
      "Tao lai link thanh toan",
    );
    return payos.paymentRequests.create(paymentData);
  }
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
    const siteUrl = getSiteUrl();
    const expiredAt = Math.floor(Date.now() / 1000) + 300;

    const paymentData = {
      orderCode,
      amount: Math.round(depositAmount),
      description,
      returnUrl: `${siteUrl}/checkout/success`,
      cancelUrl: `${siteUrl}/checkout/cancel`,
      expiredAt,
    };

    const result = await createPayOSLink(payos, paymentData);

    await supabase
      .from("orders")
      .update({
        payment_gateway: "payos",
        payment_reference: String(orderCode),
      })
      .eq("id", rawOrderId);

    return NextResponse.json({
      checkoutUrl: result?.checkoutUrl || null,
      qrCode: result?.qrCode || null,
      expiredAt: result?.expiredAt ?? expiredAt,
      data: result,
    });
  } catch (error) {
    console.error("[create-payment-link]", error);
    const detail = getErrorMessage(error);
    const missingEnv = detail.includes("Missing PayOS env vars");

    return NextResponse.json(
      {
        error: missingEnv
          ? "Thiếu cấu hình PayOS trên server (PAYOS_CLIENT_ID/API_KEY/CHECKSUM_KEY)."
          : "Không thể tạo link thanh toán PayOS.",
        detail,
      },
      { status: 500 },
    );
  }
}
