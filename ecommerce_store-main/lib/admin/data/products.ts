import {
  imageFieldsToDbPayload,
  readImageFieldsFromRow,
} from "@/lib/admin/product-images";
import { isStoreCategory } from "@/lib/store/map-product";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type {
  CreateProductInput,
  DbProduct,
  StoreProductCategory,
  UpdateProductInput,
} from "@/lib/supabase/types";
import {
  PRIMARY_PRODUCT_SELECT,
  queryAllProducts,
  queryProductById,
} from "@/lib/store/product-query";
import { failure, success, type ActionResult } from "@/lib/admin/result";

function normalizeSizes(raw: unknown): DbProduct["sizes"] {
  if (Array.isArray(raw)) {
    return raw.map((entry) => {
      const row = entry as { size?: string | null; quantity?: number };
      const sizeValue = row?.size;
      return {
        size:
          sizeValue === null || sizeValue === undefined
            ? null
            : String(sizeValue).trim() || null,
        quantity: Math.max(0, Number(row?.quantity) || 0),
      };
    });
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      return normalizeSizes(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeCategory(raw: unknown): StoreProductCategory {
  const value = String(raw ?? "sneakers").trim().toLowerCase();
  return isStoreCategory(value) ? value : "sneakers";
}

function mapProduct(row: Record<string, unknown>): DbProduct | null {
  const id = String(row.id ?? "").trim();
  if (!id) return null;

  const images = readImageFieldsFromRow(row);
  return {
    id,
    name: String(row.name ?? ""),
    brand_tag: String(row.brand_tag ?? row.brand ?? "stusport"),
    category: normalizeCategory(row.category),
    fulfillment_type:
      row.fulfillment_type === "pre_order" ? "pre_order" : "in_stock",
    price: Number(row.price),
    sale_percent:
      row.sale_percent == null ? 0 : Number(row.sale_percent),
    description:
      row.description == null ? null : String(row.description),
    sizes: normalizeSizes(row.sizes),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    ...images,
    images: Array.isArray(row.images)
      ? (row.images as string[])
      : undefined,
  };
}

function buildDbRow(input: CreateProductInput | UpdateProductInput) {
  const row: Record<string, unknown> = {};
  if ("name" in input && input.name !== undefined) row.name = input.name;
  if ("brand_tag" in input && input.brand_tag !== undefined) {
    row.brand_tag = input.brand_tag;
  }
  if ("category" in input && input.category !== undefined) {
    row.category = input.category;
  }
  if ("fulfillment_type" in input && input.fulfillment_type !== undefined) {
    row.fulfillment_type = input.fulfillment_type;
  }
  if ("price" in input && input.price !== undefined) row.price = input.price;
  if ("sale_percent" in input && input.sale_percent !== undefined) {
    row.sale_percent = input.sale_percent;
  }
  if ("description" in input) row.description = input.description ?? null;
  if ("sizes" in input && input.sizes !== undefined) row.sizes = input.sizes;

  if (
    "image_url_1" in input ||
    "image_url_2" in input ||
    "image_url_3" in input ||
    "image_url_4" in input ||
    "image_url_5" in input
  ) {
    Object.assign(
      row,
      imageFieldsToDbPayload({
        image_url_1: input.image_url_1 ?? null,
        image_url_2: input.image_url_2 ?? null,
        image_url_3: input.image_url_3 ?? null,
        image_url_4: input.image_url_4 ?? null,
        image_url_5: input.image_url_5 ?? null,
      }),
    );
  }

  return row;
}

export async function listProducts(): Promise<ActionResult<DbProduct[]>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await queryAllProducts(supabase);

  if (error) return failure(error);
  const products = data
    .map((row) => mapProduct(row))
    .filter((row): row is DbProduct => row != null);
  return success(products);
}

export async function getProduct(id: string): Promise<ActionResult<DbProduct>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await queryProductById(supabase, id.trim());

  if (error) return failure(error);
  if (!data) return failure("Không tìm thấy sản phẩm.");
  const product = mapProduct(data);
  if (!product) return failure("Dữ liệu sản phẩm không hợp lệ.");
  return success(product);
}

export async function createProduct(
  input: CreateProductInput,
): Promise<ActionResult<DbProduct>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      brand_tag: input.brand_tag,
      category: input.category,
      fulfillment_type: input.fulfillment_type ?? "in_stock",
      price: input.price,
      sale_percent: input.sale_percent ?? 0,
      description: input.description ?? null,
      sizes: input.sizes ?? [],
      ...imageFieldsToDbPayload(input),
    })
    .select(PRIMARY_PRODUCT_SELECT)
    .single();

  if (error) return failure(error.message);
  const product = mapProduct(data as Record<string, unknown>);
  if (!product) return failure("Không đọc được sản phẩm vừa tạo.");
  return success(product);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ActionResult<DbProduct>> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .update(buildDbRow(input))
    .eq("id", id)
    .select(PRIMARY_PRODUCT_SELECT)
    .single();

  if (error) return failure(error.message);
  const product = mapProduct(data as Record<string, unknown>);
  if (!product) return failure("Không đọc được sản phẩm sau cập nhật.");
  return success(product);
}

export async function deleteProduct(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return failure(error.message);
  return success({ id });
}
