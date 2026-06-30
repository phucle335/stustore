import type { DbProduct, ProductImageFields } from "@/lib/supabase/types";

export const PRODUCT_IMAGE_SLOTS = [
  "image_url_1",
  "image_url_2",
  "image_url_3",
  "image_url_4",
  "image_url_5",
] as const;

export type ProductImageSlot = (typeof PRODUCT_IMAGE_SLOTS)[number];

export const PRODUCT_IMAGE_LABELS = [
  "Image 1 (main)",
  "Image 2",
  "Image 3",
  "Image 4",
  "Image 5",
] as const;

export type ProductImageFormState = {
  [K in ProductImageSlot]: string;
};

export function emptyImageFields(): ProductImageFormState {
  return {
    image_url_1: "",
    image_url_2: "",
    image_url_3: "",
    image_url_4: "",
    image_url_5: "",
  };
}

function cleanUrl(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Read from DB row (image_url_1…5 or legacy images[] column) */
export function readImageFieldsFromRow(
  row: Record<string, unknown>,
): ProductImageFormState {
  const legacyImages = Array.isArray(row.images)
    ? (row.images as unknown[]).map((u) => cleanUrl(u)).filter(Boolean)
    : [];

  const fields = emptyImageFields();
  for (let i = 0; i < PRODUCT_IMAGE_SLOTS.length; i++) {
    const key = PRODUCT_IMAGE_SLOTS[i];
    const fromColumn = cleanUrl(row[key]);
    const fromLegacy = legacyImages[i] ?? "";
    fields[key] = fromColumn || fromLegacy;
  }
  return fields;
}

export function imageFieldsToArray(
  fields: ProductImageFormState | ProductImageFields,
): string[] {
  return PRODUCT_IMAGE_SLOTS.map((key) => cleanUrl(fields[key])).filter(
    Boolean,
  );
}

/** Supabase write payload — null if field is empty */
export function imageFieldsToDbPayload(
  fields: Partial<ProductImageFields> | ProductImageFormState,
): ProductImageFields {
  const payload: ProductImageFields = {
    image_url_1: null,
    image_url_2: null,
    image_url_3: null,
    image_url_4: null,
    image_url_5: null,
  };
  for (const key of PRODUCT_IMAGE_SLOTS) {
    const url = cleanUrl(fields[key]);
    payload[key] = url || null;
  }
  return payload;
}

export function productToImageFields(product: DbProduct): ProductImageFormState {
  return readImageFieldsFromRow(product as unknown as Record<string, unknown>);
}
