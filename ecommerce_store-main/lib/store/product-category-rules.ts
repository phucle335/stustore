import type { ProductCategory } from "@/lib/store/types";
import type { ProductSizeStock, StoreProductCategory } from "@/lib/supabase/types";

/** Danh mục không có thuộc tính size (chỉ quản lý số lượng tổng) */
export const CATEGORIES_WITHOUT_SIZES: StoreProductCategory[] = [
  "watches",
  "sunglasses",
  "bags",
];

export function isCategoryWithoutSizes(
  category: string | null | undefined,
): boolean {
  const value = (category ?? "").trim().toLowerCase();
  return (CATEGORIES_WITHOUT_SIZES as string[]).includes(value);
}

export function totalQuantityFromSizeRows(
  rows: ProductSizeStock[] | { size?: string | null; quantity?: number }[],
): number {
  return rows.reduce(
    (sum, row) => sum + Math.max(0, Number(row?.quantity) || 0),
    0,
  );
}

/** Đọc từ DB → state form admin */
export function sizesToFormState(
  category: StoreProductCategory | undefined,
  raw: unknown,
): ProductSizeStock[] {
  const rows = normalizeSizeRows(raw);

  if (isCategoryWithoutSizes(category)) {
    const qty =
      rows
        .filter((row) => !row.size)
        .reduce((sum, row) => sum + row.quantity, 0) ||
      totalQuantityFromSizeRows(rows);
    return [{ size: "", quantity: qty }];
  }

  const withSize = rows.filter((row) => row.size.length > 0);
  return withSize.length > 0 ? withSize : [{ size: "40", quantity: 0 }];
}

/** Form admin → jsonb gửi Supabase */
export function sizesToDbPayload(
  category: StoreProductCategory,
  rows: ProductSizeStock[],
): ProductSizeStock[] {
  if (isCategoryWithoutSizes(category)) {
    const quantity = totalQuantityFromSizeRows(rows);
    return [{ size: null, quantity }];
  }

  return rows
    .map((row) => ({
      size: row.size?.trim() || null,
      quantity: Math.max(0, Number(row.quantity) || 0),
    }))
    .filter(
      (row): row is ProductSizeStock & { size: string } =>
        typeof row.size === "string" && row.size.length > 0,
    );
}

function normalizeSizeRows(raw: unknown): { size: string; quantity: number }[] {
  if (!Array.isArray(raw)) {
    if (typeof raw === "string" && raw.trim()) {
      try {
        return normalizeSizeRows(JSON.parse(raw));
      } catch {
        return [];
      }
    }
    return [];
  }

  return raw.map((entry) => {
    const row = entry as { size?: string | null; quantity?: number };
    const sizeValue = row?.size;
    return {
      size:
        sizeValue === null || sizeValue === undefined
          ? ""
          : String(sizeValue).trim(),
      quantity: Math.max(0, Number(row?.quantity) || 0),
    };
  });
}

/** Chuẩn hóa hiển thị storefront */
export function mapSizesForStorefront(
  category: ProductCategory,
  raw: unknown,
): {
  stock: number;
  sizes?: string[];
  sizeStock?: Record<string, number>;
} {
  const rows = normalizeSizeRows(raw);

  if (isCategoryWithoutSizes(category)) {
    const stock =
      rows
        .filter((row) => !row.size)
        .reduce((sum, row) => sum + row.quantity, 0) ||
      totalQuantityFromSizeRows(rows);
    return { stock };
  }

  const sizedRows = rows.filter((row) => row.size.length > 0);
  if (sizedRows.length === 0) {
    return { stock: 0 };
  }

  const sizeStock = Object.fromEntries(
    sizedRows.map((row) => [row.size, row.quantity] as const),
  );
  const stock = sizedRows.reduce((sum, row) => sum + row.quantity, 0);

  return {
    stock,
    sizes: sizedRows.map((row) => row.size),
    sizeStock,
  };
}
