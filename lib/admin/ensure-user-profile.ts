import { isAdminEmail } from "@/lib/admin/constants";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

function resolveRole(email: string, existingRole?: UserRole | null): UserRole {
  if (isAdminEmail(email)) return "admin";
  if (existingRole === "admin") return "admin";
  return "user";
}

function normalizeFullName(fullName?: string | null): string | null {
  const trimmed = fullName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function isMissingFullNameColumn(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("full_name") &&
    (lower.includes("does not exist") ||
      lower.includes("column") ||
      lower.includes("schema cache"))
  );
}

type ExistingRow = { role?: UserRole; full_name?: string | null };

/** Ensure public.users row exists (service role — not subject to RLS). */
export async function ensureUserProfile(
  userId: string,
  email: string,
  fullName?: string | null,
): Promise<
  | { ok: true; role: UserRole; full_name: string | null }
  | { ok: false; error: string }
> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedName = normalizeFullName(fullName);

  try {
    const admin = createAdminSupabaseClient();

    let includeFullName = true;
    let existing: ExistingRow | null = null;

    const readWithName = await admin
      .from("users")
      .select("role, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (readWithName.error) {
      if (isMissingFullNameColumn(readWithName.error.message)) {
        includeFullName = false;
        const readLegacy = await admin
          .from("users")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (readLegacy.error) {
          const msg = readLegacy.error.message;
          if (msg.includes("relation") || readLegacy.error.code === "42P01") {
            return {
              ok: false,
              error:
                "The public.users table does not exist. Run supabase/admin-schema.sql in the Supabase SQL Editor.",
            };
          }
          return { ok: false, error: msg };
        }
        existing = readLegacy.data as ExistingRow | null;
      } else {
        const msg = readWithName.error.message;
        if (msg.includes("relation") || readWithName.error.code === "42P01") {
          return {
            ok: false,
            error:
              "The public.users table does not exist. Run supabase/admin-schema.sql in the Supabase SQL Editor.",
          };
        }
        return { ok: false, error: msg };
      }
    } else {
      existing = readWithName.data as ExistingRow | null;
    }

    const role = resolveRole(
      normalizedEmail,
      existing?.role as UserRole | undefined,
    );

    const full_name = includeFullName
      ? normalizedName ??
        (typeof existing?.full_name === "string"
          ? normalizeFullName(existing.full_name)
          : null)
      : normalizedName;

    const basePayload = { email: normalizedEmail, role };
    const payloadWithName =
      includeFullName && full_name
        ? { ...basePayload, full_name }
        : basePayload;

    const writeQuery = existing
      ? admin.from("users").update(payloadWithName).eq("id", userId)
      : admin.from("users").insert({ id: userId, ...payloadWithName });

    const selectFields = includeFullName ? "role, full_name" : "role";
    const { data, error: writeError } = await writeQuery
      .select(selectFields)
      .maybeSingle();

    if (writeError?.message && isMissingFullNameColumn(writeError.message)) {
      const legacyPayload = basePayload;
      const legacyQuery = existing
        ? admin.from("users").update(legacyPayload).eq("id", userId)
        : admin.from("users").insert({ id: userId, ...legacyPayload });

      const legacyResult = await legacyQuery.select("role").maybeSingle();
      if (legacyResult.error) {
        return { ok: false, error: legacyResult.error.message };
      }

      return {
        ok: true,
        role: (legacyResult.data?.role as UserRole) ?? role,
        full_name: normalizedName,
      };
    }

    if (writeError) {
      return { ok: false, error: writeError.message };
    }

    const row = data as ExistingRow | null;

    return {
      ok: true,
      role: (row?.role as UserRole) ?? role,
      full_name: includeFullName
        ? typeof row?.full_name === "string"
          ? normalizeFullName(row.full_name)
          : full_name
        : normalizedName,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not sync user profile.",
    };
  }
}
