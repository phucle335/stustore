"use server";

import { withAdminAction } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { failure, success, type ActionResult } from "@/lib/admin/result";
import type { AdminAuditLog, DbNotification } from "@/lib/supabase/types";

const ADMIN_LIMIT = 20;

export async function getAdminAuditLogsAction(): Promise<
  ActionResult<AdminAuditLog[]>
> {
  return withAdminAction(async () => {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(ADMIN_LIMIT);

    if (error) return failure(error.message);
    return success((data ?? []) as AdminAuditLog[]);
  });
}

export async function getAdminNotificationsAction(): Promise<
  ActionResult<DbNotification[]>
> {
  return withAdminAction(async () => {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(ADMIN_LIMIT);

    if (error) return failure(error.message);
    return success((data ?? []) as DbNotification[]);
  });
}

