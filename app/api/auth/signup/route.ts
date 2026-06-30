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
    return "This email is already registered. Sign in or use a different email.";
  }
  return mapAuthErrorMessage(message);
}

/** Create account via service role — skip confirmation email (avoid Supabase SMTP rate limit). */
export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const fullName = body.full_name?.trim() ?? "";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  if (!fullName) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
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
      err instanceof Error ? err.message : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
