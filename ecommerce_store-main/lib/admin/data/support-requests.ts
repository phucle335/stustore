import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { DbSupportRequest } from "@/lib/supabase/types";
import { failure, success, type ActionResult } from "@/lib/admin/result";

function mapRow(row: DbSupportRequest): DbSupportRequest {
  return {
    ...row,
    resolved_at:
      row.resolved_at === undefined ? null : (row.resolved_at as any),
  };
}

export async function listSupportRequests(): Promise<ActionResult<DbSupportRequest[]>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return failure(error.message);
  return success((data ?? []).map((row) => mapRow(row as DbSupportRequest)));
}

export async function resolveSupportRequest(
  id: string,
  adminUserId: string,
): Promise<ActionResult<DbSupportRequest>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("support_requests")
    .update({
      status: "resolved",
      handled_by: adminUserId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return failure(error.message);
  return success(mapRow(data as DbSupportRequest));
}

