import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type {
  AdminAuditLog,
  DbNotification,
  NotificationType,
} from "@/lib/supabase/types";

type LogOptions = {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  diff?: Record<string, unknown>;
};

type NotifyOptions = {
  type: NotificationType;
  title: string;
  body?: string;
  entityType?: string | null;
  entityId?: string | null;
};

export async function logAdminAuditAndNotification(
  log: LogOptions,
  notify?: NotifyOptions,
) {
  const supabase = createAdminSupabaseClient();

  const { error: auditError } = await supabase.from("admin_audit_logs").insert({
    admin_user_id: log.adminUserId,
    action: log.action,
    entity_type: log.entityType,
    entity_id: log.entityId ?? null,
    diff: log.diff ?? {},
  });

  if (auditError) {
    console.error("[admin-audit] audit insert failed:", auditError);
  }

  if (notify) {
    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        type: notify.type,
        title: notify.title,
        body: notify.body ?? null,
        entity_type: notify.entityType ?? null,
        entity_id: notify.entityId ?? null,
      });
    if (notifError) {
      console.error("[admin-audit] notification insert failed:", notifError);
    }
  }
}

