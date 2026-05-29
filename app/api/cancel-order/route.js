import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/account/require-user";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function POST(request) {
  try {
    const auth = await requireAuthUser();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const orderId = String(body?.orderId ?? "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId không hợp lệ." }, { status: 400 });
    }

    const supabase = await createAuthServerClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || "Không tìm thấy đơn hàng." },
        { status: 404 },
      );
    }

    if (order.user_id !== auth.user.id) {
      return NextResponse.json(
        { error: "Bạn không có quyền hủy đơn hàng này." },
        { status: 403 },
      );
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Đơn hàng không còn ở trạng thái chờ thanh toán." },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "cancelled", orderId });
  } catch (error) {
    console.error("[cancel-order]", error);
    return NextResponse.json(
      { error: "Không thể hủy đơn hàng." },
      { status: 500 },
    );
  }
}
