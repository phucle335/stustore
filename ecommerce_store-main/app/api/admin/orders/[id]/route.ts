import { jsonResult, parseJsonBody, withAdminApi } from "@/lib/admin/api";
import * as orders from "@/lib/admin/data/orders";
import type { UpdateOrderInput } from "@/lib/supabase/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAdminApi(() => orders.getOrder(id));
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateOrderInput>(request);
  if (!body) {
    return jsonResult({ ok: false, error: "Invalid JSON body" });
  }
  return withAdminApi(() => orders.updateOrder(id, body));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAdminApi(() => orders.deleteOrder(id));
}
