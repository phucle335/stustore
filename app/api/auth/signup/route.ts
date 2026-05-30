import { NextResponse } from "next/server";
import { mapAuthErrorMessage } from "@/lib/auth/password-reset";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type SignupBody = {
  email?: string;
  password?: string;
  full_name?: string;
};

function mapSignupErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("already") ||
    lower.includes("registered") ||
    lower.includes("exists") ||
    lower.includes("duplicate")
  ) {
    return "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.";
  }
  return mapAuthErrorMessage(message);
}

/** Tạo tài khoản qua service role — không gửi email xác nhận (tránh rate limit SMTP Supabase). */
export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const fullName = body.full_name?.trim() ?? "";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Vui lòng nhập email hợp lệ." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Mật khẩu phải có ít nhất 6 ký tự." },
      { status: 400 },
    );
  }

  if (!fullName) {
    return NextResponse.json({ error: "Vui lòng nhập họ tên." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      return NextResponse.json(
        { error: mapSignupErrorMessage(error.message) },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, userId: data.user?.id ?? null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không tạo được tài khoản.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
