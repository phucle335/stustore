import { NextResponse } from "next/server";
import { loadMemberProfile } from "@/lib/account/load-member-profile";
import { requireAuthUser } from "@/lib/account/require-user";
import { resolveDisplayName } from "@/lib/auth/display-name";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import type { MemberProfileInput } from "@/lib/supabase/types";

export async function GET() {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const metaName =
    typeof auth.user.user_metadata?.full_name === "string"
      ? auth.user.user_metadata.full_name
      : null;

  const result = await loadMemberProfile(
    auth.user.id,
    auth.user.email!,
    metaName,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      ...result.data,
      display_name: resolveDisplayName(
        result.data.full_name,
        result.data.email,
      ),
    },
    warning: result.warning,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAuthUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: MemberProfileInput;
  try {
    body = (await request.json()) as MemberProfileInput;
  } catch {
    return NextResponse.json({ error: "Invalid data." }, { status: 400 });
  }

  const preferencesOnly =
    (body.newsletter_opt_in !== undefined ||
      body.personalized_recommendations !== undefined ||
      body.personalized_ads !== undefined) &&
    body.full_name === undefined &&
    body.phone === undefined &&
    body.address === undefined &&
    body.birthday === undefined &&
    body.gender === undefined;

  if (!preferencesOnly) {
    const address = body.address?.trim() ?? "";
    if (!address) {
      return NextResponse.json(
        { error: "Delivery address is required when saving profile." },
        { status: 400 },
      );
    }
  }

  const supabase = await createAuthServerClient();
  const updatePayload: Record<string, unknown> = {};

  if (body.full_name !== undefined) {
    updatePayload.full_name = body.full_name?.trim() || null;
  }
  if (body.phone !== undefined) {
    updatePayload.phone = body.phone?.trim() || null;
  }
  if (body.address !== undefined) {
    updatePayload.address = body.address.trim();
  }
  if (body.birthday !== undefined) {
    updatePayload.birthday = body.birthday || null;
  }
  if (body.gender !== undefined) {
    updatePayload.gender = body.gender || null;
  }
  if (body.newsletter_opt_in !== undefined) {
    updatePayload.newsletter_opt_in = Boolean(body.newsletter_opt_in);
  }
  if (body.personalized_recommendations !== undefined) {
    updatePayload.personalized_recommendations = Boolean(
      body.personalized_recommendations,
    );
  }
  if (body.personalized_ads !== undefined) {
    updatePayload.personalized_ads = Boolean(body.personalized_ads);
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: "No data to update." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", auth.user.id);

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("does not exist") || msg.includes("schema cache")) {
      return NextResponse.json(
        {
          error:
            "Missing column in users table. Run supabase/member-features.sql in Supabase SQL Editor.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reload = await loadMemberProfile(
    auth.user.id,
    auth.user.email!,
    typeof body.full_name === "string" ? body.full_name : null,
  );

  if (!reload.ok) {
    return NextResponse.json({ error: reload.error }, { status: 500 });
  }

  return NextResponse.json({ data: reload.data });
}
