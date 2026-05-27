import { jsonResult, parseJsonBody, withAdminApi } from "@/lib/admin/api";
import * as users from "@/lib/admin/data/users";
import type { UserRole } from "@/lib/supabase/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<{ role: UserRole }>(request);

  if (!body?.role || (body.role !== "user" && body.role !== "admin")) {
    return jsonResult({
      ok: false,
      error: "role must be 'user' or 'admin'",
    });
  }

  return withAdminApi(() => users.assignUserRole(id, body.role));
}
