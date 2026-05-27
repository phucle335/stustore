import { jsonResult, parseJsonBody, withAdminApi } from "@/lib/admin/api";
import * as products from "@/lib/admin/data/products";
import type { CreateProductInput } from "@/lib/supabase/types";

export async function GET() {
  return withAdminApi(() => products.listProducts());
}

export async function POST(request: Request) {
  return withAdminApi(async () => {
    const body = await parseJsonBody<CreateProductInput>(request);
    if (!body?.name || !body?.brand_tag || body.price == null) {
      return {
        ok: false as const,
        error: "name, brand_tag, and price are required",
      };
    }
    return products.createProduct(body);
  }, 201);
}
