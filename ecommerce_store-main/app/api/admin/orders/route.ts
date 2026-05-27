import { jsonResult, parseJsonBody, withAdminApi } from "@/lib/admin/api";
import * as orders from "@/lib/admin/data/orders";
import type { CreateOrderInput } from "@/lib/supabase/types";

export async function GET() {
  return withAdminApi(() => orders.listOrders());
}

export async function POST(request: Request) {
  return withAdminApi(async () => {
    const body = await parseJsonBody<CreateOrderInput>(request);
    if (!body || body.total_price == null) {
      return { ok: false as const, error: "total_price is required" };
    }
    return orders.createOrder(body);
  }, 201);
}
