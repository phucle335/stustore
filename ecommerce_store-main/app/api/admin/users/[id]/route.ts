import { jsonResult, parseJsonBody, withAdminApi } from "@/lib/admin/api";
import * as users from "@/lib/admin/data/users";
import type { UpdateUserInput } from "@/lib/supabase/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAdminApi(() => users.getUser(id));
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateUserInput>(request);
  if (!body) {
    return jsonResult({ ok: false, error: "Invalid JSON body" });
  }
  return withAdminApi(() => users.updateUser(id, body));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAdminApi(() => users.deleteUser(id));
}
