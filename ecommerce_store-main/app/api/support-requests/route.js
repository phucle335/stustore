import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

function normalizePhone(input) {
  const raw = String(input ?? "").trim();
  // Only keep digits to match typical Zalo/phone formats.
  return raw.replace(/\D/g, "");
}

function normalizeEmail(input) {
  return String(input ?? "").trim().toLowerCase();
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body?.name ?? "").trim();
    const phone = normalizePhone(body?.phone);
    const email = normalizeEmail(body?.email);
    const message = String(body?.message ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json(
        { error: "Vui lòng nhập số điện thoại/Zalo." },
        { status: 400 },
      );
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Vui lòng nhập email hợp lệ." }, { status: 400 });
    }
    if (message.length < 5) {
      return NextResponse.json(
        { error: "Vui lòng nhập nội dung hỗ trợ chi tiết hơn." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("support_requests")
      .insert({
        name,
        phone,
        email,
        message,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create dashboard notification (support_request)
    const insertedId = data?.id;
    if (insertedId) {
      const title = "Khách hàng gửi yêu cầu hỗ trợ mới";
      await supabase.from("notifications").insert({
        type: "support_request",
        title,
        body: message,
        entity_type: "support_request",
        entity_id: String(insertedId),
      });
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[support-requests]", err);
    return NextResponse.json(
      { error: "Không thể gửi yêu cầu hỗ trợ." },
      { status: 500 },
    );
  }
}

