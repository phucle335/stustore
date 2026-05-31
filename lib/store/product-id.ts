/** True when id can be used in Supabase `.eq("id", …)` on a bigint products.id column. */
export function isNumericProductId(id: string): boolean {
  return /^\d+$/.test(id.trim());
}

/** True when id can be used on a uuid products.id column. */
export function isUuidProductId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id.trim(),
  );
}

/**
 * Slug-style ids (e.g. sun-3 from legacy mock catalog) must not be sent to bigint id filters.
 */
export function canQueryProductIdInDatabase(id: string): boolean {
  const trimmed = id.trim();
  if (!trimmed) {
    return false;
  }
  return isNumericProductId(trimmed) || isUuidProductId(trimmed);
}

/** Mã tự đặt trong admin — chữ, số, gạch ngang, gạch dưới (vd. SP001, air-max-01). */
export function normalizeProductCode(raw?: string | null): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(trimmed)) return undefined;
  return trimmed;
}

export function isValidProductCode(raw?: string | null): boolean {
  return normalizeProductCode(raw) !== undefined;
}

export function productCodeValidationMessage(): string {
  return "Mã sản phẩm gồm 1–64 ký tự: chữ, số, gạch ngang (-) hoặc gạch dưới (_). Ví dụ: SP001, air-max-01.";
}

export function getProductManageCode(product: {
  product_code?: string | null;
  id: string;
}): string {
  const code = product.product_code?.trim();
  return code || product.id;
}
