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
