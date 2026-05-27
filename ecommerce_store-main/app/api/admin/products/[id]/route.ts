import { jsonResult, parseJsonBody, withAdminApi } from "@/lib/admin/api";
import * as products from "@/lib/admin/data/products";
import type { UpdateProductInput } from "@/lib/supabase/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAdminApi(() => products.getProduct(id));
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await parseJsonBody<UpdateProductInput>(request);
  if (!body) {
    return jsonResult({ ok: false, error: "Invalid JSON body" });
  }
  return withAdminApi(() => products.updateProduct(id, body));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return withAdminApi(() => products.deleteProduct(id));
}
