import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin/constants";

/**
 * Kiểm tra quyền admin — dùng RPC security definer (tránh RLS chặn đọc profile).
 */
export async function userIsAdmin(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  if (isAdminEmail(user.email)) return true;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (!error && isAdmin === true) return true;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin";
}
