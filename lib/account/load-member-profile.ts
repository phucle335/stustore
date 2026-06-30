import "server-only";

import { ensureUserProfile } from "@/lib/admin/ensure-user-profile";
import {
  emptyMemberProfile,
  isMissingProfileColumn,
  mapMemberProfileRow,
  type MemberProfile,
} from "@/lib/account/member-profile.shared";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

const FULL_COLUMNS =
  "email, full_name, phone, address, birthday, gender, newsletter_opt_in, personalized_recommendations, personalized_ads";

const LEGACY_COLUMNS = "email, full_name, phone, address";

/** Read member profile; auto-syncs user + fallback when SQL columns are missing. */
export async function loadMemberProfile(
  userId: string,
  email: string,
  metaFullName?: string | null,
): Promise<
  | { ok: true; data: MemberProfile; warning?: string }
  | { ok: false; error: string }
> {
  const ensured = await ensureUserProfile(userId, email, metaFullName);
  if (!ensured.ok) {
    return { ok: false, error: ensured.error };
  }

  const supabase = await createAuthServerClient();
  let warning: string | undefined;
  let lastError: string | undefined;

  for (const columns of [FULL_COLUMNS, LEGACY_COLUMNS, "email, full_name", "email"]) {
    const { data, error } = await supabase
      .from("users")
      .select(columns)
      .eq("id", userId)
      .maybeSingle();

    if (!error) {
      const profile = mapMemberProfileRow(
        (data as Record<string, unknown> | null) ?? null,
        email,
      );
      if (columns !== FULL_COLUMNS) {
        warning =
          "Run supabase/member-features.sql in Supabase to enable full profile fields and preferences.";
      }
      return { ok: true, data: profile, warning };
    }

    lastError = error.message;
    if (!isMissingProfileColumn(error.message)) {
      return { ok: false, error: error.message };
    }
  }

  return {
    ok: true,
    data: emptyMemberProfile(email, metaFullName ?? ensured.full_name),
    warning:
      lastError ??
      "Run supabase/member-features.sql in the Supabase SQL Editor.",
  };
}
