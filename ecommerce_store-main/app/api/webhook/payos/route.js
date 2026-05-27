import { NextResponse } from "next/server";
import { PayOS } from "@payos/node";
import { createClient } from "@supabase/supabase-js";

function getPayOS() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("Missing PayOS env vars");
  }

  return new PayOS(clientId, apiKey, checksumKey);
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

export async function POST(request) {
  try {
    const body = await request.json();
    const payos = getPayOS();

    const verified = payos.verifyPaymentWebhookData(body);

    const webhookCode = String(verified?.code ?? body?.code ?? "");
    const orderCode = verified?.orderCode ?? verified?.data?.orderCode ?? body?.data?.orderCode;

    if (!orderCode) {
      return NextResponse.json({ ok: true, message: "No orderCode" });
    }

    if (webhookCode === "00") {
      const supabase = getSupabaseAdmin();
      const orderId = String(orderCode);

      const { error } = await supabase
        .from("orders")
        .update({ status: "deposit_paid" })
        .eq("id", orderId);

      if (error) {
        console.error("[payos-webhook][supabase-update-error]", error);
        return NextResponse.json(
          { error: "Webhook verified nhưng update đơn thất bại." },
          { status: 500 },
        );
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
