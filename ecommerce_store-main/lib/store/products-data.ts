import { unstable_cache } from "next/cache";
import { mapDbProductToDetail } from "@/lib/store/map-product";
import { queryAllProducts, queryProductById } from "@/lib/store/product-query";
import type { ProductCategory, ProductDetail } from "@/lib/store/types";
import { createStoreSupabaseClient } from "@/lib/supabase/store-server";

export const STORE_PRODUCTS_TAG = "store-products";

function normalizeProductId(id: string): string {
  return decodeURIComponent(id).trim();
}

function mapRow(row: Record<string, unknown>): ProductDetail | null {
  try {
    const product = mapDbProductToDetail(row);
    if (!product.id) return null;
    return product;
  } catch {
    return null;
  }
}

async function fetchAllProductsFromDb(): Promise<ProductDetail[]> {
  const supabase = createStoreSupabaseClient();
  const { data, error } = await queryAllProducts(supabase);

  if (error) {
    throw new Error(`Không tải được sản phẩm: ${error}`);
  }

  return data
    .map((row) => mapRow(row))
    .filter((product): product is ProductDetail => product != null);
}

export const getAllProducts = unstable_cache(
  fetchAllProductsFromDb,
  ["store-all-products"],
  { tags: [STORE_PRODUCTS_TAG], revalidate: 60 },
);

async function fetchProductByIdFromDb(
  id: string,
): Promise<ProductDetail | undefined> {
  const productId = normalizeProductId(id);
  if (!productId) return undefined;

  const supabase = createStoreSupabaseClient();
  const { data, error } = await queryProductById(supabase, productId);

  if (error || !data) return undefined;
  return mapRow(data) ?? undefined;
}

/** Đọc trực tiếp từ DB — không phụ thuộc cache danh sách */
export async function getProductById(
  id: string,
): Promise<ProductDetail | undefined> {
  const direct = await fetchProductByIdFromDb(id);
  if (direct) return direct;

  const productId = normalizeProductId(id);
  const products = await getAllProducts();
  return products.find((product) => String(product.id) === productId);
}

export async function getAllProductIds(): Promise<string[]> {
  const products = await getAllProducts();
  return products.map((product) => product.id);
}

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<ProductDetail[]> {
  const products = await getAllProducts();
  return products.filter((product) => product.category === category);
}

export async function getRelatedProductsByBrand(
  productId: string,
  brand: string,
  limit = 8,
): Promise<ProductDetail[]> {
  const products = await getAllProducts();
  const normalizedId = normalizeProductId(productId);
  return products
    .filter(
      (product) =>
        product.brand === brand && String(product.id) !== normalizedId,
    )
    .slice(0, limit);
}

export type ProductStockSnapshot = {
  stock: number;
  sizeStock?: Record<string, number>;
};

export async function getProductStockMap(): Promise<
  Record<string, ProductStockSnapshot>
> {
  const products = await getAllProducts();
  return Object.fromEntries(
    products.map((product) => [
      String(product.id),
      {
        stock: product.stock,
        sizeStock: product.sizeStock,
      },
    ]),
  );
}

export function getStockForProduct(
  product: ProductDetail | undefined,
  size?: string,
): number {
  if (!product) return 0;
  if (size !== undefined && product.sizeStock !== undefined) {
    return product.sizeStock[size] ?? 0;
  }
  return product.stock;
}
