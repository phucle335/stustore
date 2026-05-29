import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { DbUser, UpdateUserInput, UserRole } from "@/lib/supabase/types";
import { failure, success, type ActionResult } from "@/lib/admin/result";

export async function listCustomers(): Promise<ActionResult<DbUser[]>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return failure(error.message);
  return success((data ?? []) as DbUser[]);
}

export async function listUsersByRole(
  role?: UserRole,
): Promise<ActionResult<DbUser[]>> {
  const supabase = createAdminSupabaseClient();
  let query = supabase.from("users").select("*").order("created_at", {
    ascending: false,
  });

  if (role) {
    query = query.eq("role", role);
  }

  const { data, error } = await query;
  if (error) return failure(error.message);
  return success((data ?? []) as DbUser[]);
}

export async function getUser(id: string): Promise<ActionResult<DbUser>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return failure(error.message);
  return success(data as DbUser);
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<ActionResult<DbUser>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return failure(error.message);
  return success(data as DbUser);
}

export async function assignUserRole(
  id: string,
  role: UserRole,
): Promise<ActionResult<DbUser>> {
  return updateUser(id, { role });
}

export async function deleteUser(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();

  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) return failure(authError.message);

  return success({ id });
}
