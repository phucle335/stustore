import { NextResponse } from "next/server";
import { resolveDisplayName } from "@/lib/auth/display-name";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

function isMissingFullNameColumn(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("full_name") && lower.includes("does not exist");
}

export async function GET() {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ user: null });
  }

  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  let profile: {
    full_name?: string | null;
    email?: string;
    role?: string;
  } | null = null;

  const withName = await supabase
    .from("users")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (withName.error && isMissingFullNameColumn(withName.error.message)) {
    const legacy = await supabase
      .from("users")
      .select("email, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = legacy.data;
  } else {
    profile = withName.data;
  }

  const fullName = profile?.full_name ?? metaName;
  const email = profile?.email ?? user.email ?? null;

  return NextResponse.json({
    user: {
      id: user.id,
      email,
      role: profile?.role ?? "user",
      full_name: fullName ?? null,
      display_name: resolveDisplayName(fullName, email),
    },
  });
}
