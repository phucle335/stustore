import { NextResponse } from "next/server";
import { resolveDisplayName } from "@/lib/auth/display-name";
import { ensureUserProfile } from "@/lib/admin/ensure-user-profile";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

type SyncBody = {
  full_name?: string;
};

/** Create/update public.users for newly logged-in Auth user (backfill when trigger is missing). */
export async function POST(request: Request) {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncBody = {};
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    body = {};
  }

  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;

  const profile = await ensureUserProfile(
    user.id,
    user.email,
    body.full_name ?? metaName,
  );

  if (!profile.ok) {
    return NextResponse.json({ error: profile.error }, { status: 500 });
  }

  return NextResponse.json({
    role: profile.role,
    full_name: profile.full_name,
    display_name: resolveDisplayName(profile.full_name, user.email),
  });
}
