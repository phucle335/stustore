import {
  imageFieldsToDbPayload,
  readImageFieldsFromRow,
} from "@/lib/admin/product-images";
import { isStoreCategory } from "@/lib/store/map-product";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type {
  CreateProductInput,
  DbProduct,
  ProductStatus,
  StoreProductCategory,
  UpdateProductInput,
} from "@/lib/supabase/types";
import {
  PRIMARY_PRODUCT_SELECT,
  queryAllProducts,
  queryProductById,
} from "@/lib/store/product-query";
import { failure, success, type ActionResult } from "@/lib/admin/result";

const LEGACY_PRODUCT_SELECT =
  "id, name, brand_tag, category, fulfillment_type, price, sale_percent, description, sizes, image_url_1, image_url_2, image_url_3, image_url_4, image_url_5, created_at, updated_at";

function isMissingProductStatusError(message: string): boolean {
  return (
    message.includes("product_status") &&
    (message.includes("column") ||
      message.includes("schema cache") ||
      message.includes("does not exist"))
  );
}

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
    product_status:
      row.product_status === "out_of_stock" || row.product_status === "paused"
        ? (row.product_status as ProductStatus)
        : "selling",
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
  if ("product_status" in input && input.product_status !== undefined) {
    row.product_status = input.product_status;
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
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name,
    brand_tag: input.brand_tag,
    category: input.category,
    fulfillment_type: input.fulfillment_type ?? "in_stock",
    product_status: input.product_status ?? "selling",
    price: input.price,
    sale_percent: input.sale_percent ?? 0,
    description: input.description ?? null,
    sizes: input.sizes ?? [],
    ...imageFieldsToDbPayload(input),
  };
  const initialCreate = await supabase
    .from("products")
    .insert(payload)
    .select(PRIMARY_PRODUCT_SELECT)
    .single();
  let data = initialCreate.data as Record<string, unknown> | null;
  let error = initialCreate.error;

  if (error && isMissingProductStatusError(error.message)) {
    const { product_status: _productStatus, ...legacyPayload } = payload;
    const retry = await supabase
      .from("products")
      .insert(legacyPayload)
      .select(LEGACY_PRODUCT_SELECT)
      .single();
    data = retry.data as Record<string, unknown> | null;
    error = retry.error;
  }

  if (error) {
    if (
      error.code === "23505" ||
      /duplicate key|already exists|products_pkey/i.test(error.message)
    ) {
      return failure("Product ID đã tồn tại. Vui lòng nhập ID khác.");
    }
    return failure(error.message);
  }
  const product = mapProduct(data as Record<string, unknown>);
  if (!product) return failure("Không đọc được sản phẩm vừa tạo.");
  return success(product);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ActionResult<DbProduct>> {
  const supabase = createAdminSupabaseClient();
  const row = buildDbRow(input);
  const initialUpdate = await supabase
    .from("products")
    .update(row)
    .eq("id", id)
    .select(PRIMARY_PRODUCT_SELECT)
    .single();
  let data = initialUpdate.data as Record<string, unknown> | null;
  let error = initialUpdate.error;

  if (error && isMissingProductStatusError(error.message)) {
    const legacyRow = { ...row };
    delete legacyRow.product_status;
    const retry = await supabase
      .from("products")
      .update(legacyRow)
      .eq("id", id)
      .select(LEGACY_PRODUCT_SELECT)
      .single();
    data = retry.data as Record<string, unknown> | null;
    error = retry.error;
  }

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

export async function deleteProducts(
  ids: string[],
): Promise<ActionResult<{ ids: string[]; count: number }>> {
  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.length === 0) {
    return failure("Không có sản phẩm nào được chọn.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("products").delete().in("id", uniqueIds);

  if (error) return failure(error.message);
  return success({ ids: uniqueIds, count: uniqueIds.length });
}

export async function updateProductStatus(
  ids: string[],
  product_status: ProductStatus,
): Promise<ActionResult<{ ids: string[]; count: number }>> {
  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.length === 0) {
    return failure("Không có sản phẩm nào được chọn.");
  }

  const supabase = createAdminSupabaseClient();
  const initialUpdate = await supabase
    .from("products")
    .update({ product_status })
    .in("id", uniqueIds)
    .select("id");

  if (initialUpdate.error && isMissingProductStatusError(initialUpdate.error.message)) {
    return failure("Cột product_status chưa có trên database.");
  }

  if (initialUpdate.error) return failure(initialUpdate.error.message);
  return success({ ids: uniqueIds, count: uniqueIds.length });
}
