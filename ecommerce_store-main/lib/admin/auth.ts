import { ensureUserProfile } from "@/lib/admin/ensure-user-profile";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import {
  failure,
  success,
  type ActionResult,
} from "@/lib/admin/result";
import type { UserRole } from "@/lib/supabase/types";

export type AdminSession = {
  userId: string;
  email: string | undefined;
  role: UserRole;
};

export async function guardAdmin(): Promise<ActionResult<AdminSession>> {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return failure("Unauthorized — hãy đăng nhập lại tại /login.");
  }

  const profile = await ensureUserProfile(user.id, user.email);

  if (!profile.ok) {
    return failure(profile.error);
  }

  if (profile.role !== "admin") {
    return failure("Forbidden: admin role required");
  }

  return success({
    userId: user.id,
    email: user.email,
    role: profile.role,
  });
}

export async function withAdminAction<T>(
  handler: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const auth = await guardAdmin();
  if (!auth.ok) return auth;
  return handler();
}
