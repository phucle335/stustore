import { createAuthServerClient } from "@/lib/supabase/auth-server";
import type { User } from "@supabase/supabase-js";

export async function requireAuthUser(): Promise<
  { ok: true; user: User } | { ok: false; error: string; status: number }
> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { ok: false, error: "Bạn cần đăng nhập.", status: 401 };
  }

  return { ok: true, user };
}
