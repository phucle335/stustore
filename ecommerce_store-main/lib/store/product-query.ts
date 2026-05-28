import type { SupabaseClient } from "@supabase/supabase-js";

/** Thử lần lượt — bảng cũ có thể thiếu sizes / category */
const PRODUCT_SELECT_VARIANTS = [
  "id, name, brand_tag, category, fulfillment_type, product_status, price, sale_percent, description, sizes, image_url_1, image_url_2, image_url_3, image_url_4, image_url_5, created_at, updated_at",
  "id, name, brand_tag, category, fulfillment_type, price, sale_percent, description, sizes, image_url_1, image_url_2, image_url_3, image_url_4, image_url_5, created_at, updated_at",
  "id, name, brand_tag, category, price, sale_percent, description, image_url_1, image_url_2, image_url_3, image_url_4, image_url_5, created_at, updated_at",
  "id, name, brand_tag, price, sale_percent, description, image_url_1, image_url_2, image_url_3, image_url_4, image_url_5",
  "*",
] as const;

export const PRIMARY_PRODUCT_SELECT = PRODUCT_SELECT_VARIANTS[0];

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("does not exist")
  );
}

export async function queryAllProducts(
  supabase: SupabaseClient,
): Promise<{ data: Record<string, unknown>[]; error: string | null }> {
  let lastError = "Unknown error";

  for (const columns of PRODUCT_SELECT_VARIANTS) {
    const { data, error } = await supabase
      .from("products")
      .select(columns)
      .order("created_at", { ascending: false });

    if (!error) {
      return {
        data: (data ?? []) as unknown as Record<string, unknown>[],
        error: null,
      };
    }

    lastError = error.message;
    if (!isMissingColumnError(error.message)) {
      break;
    }
  }

  return { data: [], error: lastError };
}

export async function queryProductById(
  supabase: SupabaseClient,
  id: string,
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  let lastError = "Unknown error";

  for (const columns of PRODUCT_SELECT_VARIANTS) {
    const { data, error } = await supabase
      .from("products")
      .select(columns)
      .eq("id", id)
      .maybeSingle();

    if (!error) {
      return {
        data: (data ?? null) as unknown as Record<string, unknown> | null,
        error: null,
      };
    }

    lastError = error.message;
    if (!isMissingColumnError(error.message)) {
      break;
    }
  }

  return { data: null, error: lastError };
}
