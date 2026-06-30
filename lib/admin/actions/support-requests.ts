"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/admin/auth";
import { withAdminAction } from "@/lib/admin/auth";
import * as supportRequests from "@/lib/admin/data/support-requests";
import type { DbSupportRequest } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/admin/result";
import { logAdminAuditAndNotification } from "@/lib/admin/audit/log";

const ADMIN_PATH = "/admin";

function revalidateSupportRequests() {
  revalidatePath(ADMIN_PATH);
}

export async function getSupportRequestsAction(): Promise<
  ActionResult<DbSupportRequest[]>
> {
  return withAdminAction(() => supportRequests.listSupportRequests());
}

export async function resolveSupportRequestAction(
  id: string,
): Promise<ActionResult<DbSupportRequest>> {
  const auth = await guardAdmin();
  if (!auth.ok) return auth as any;

  const result = await supportRequests.resolveSupportRequest(
    id,
    auth.data.userId,
  );
  if (result.ok) {
    await logAdminAuditAndNotification(
      {
        adminUserId: auth.data.userId,
        action: "support_request_resolved",
        entityType: "support_request",
        entityId: id,
        diff: { requestId: id },
      },
      {
        type: "support_request",
        title: "Support request resolved",
        body: result.data.message,
        entityType: "support_request",
        entityId: id,
      },
    );
    revalidateSupportRequests();
  }
  return result;
}

