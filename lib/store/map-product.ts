import { imageFieldsToArray, readImageFieldsFromRow } from "@/lib/admin/product-images";
import { formatPriceVnd } from "@/lib/store/cart";
import { mapSizesForStorefront } from "@/lib/store/product-category-rules";
import type {
  ProductCategory,
  ProductDetail,
  ProductFulfillmentType,
} from "@/lib/store/types";

const STORE_CATEGORIES: ProductCategory[] = [
  "sneakers",
  "sunglasses",
  "clothing",
  "bags",
  "watches",
];

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80";

export function isStoreCategory(value: string): value is ProductCategory {
  return (STORE_CATEGORIES as string[]).includes(value);
}

/** DB brand_tag → "/Nike/" format on storefront */
export function brandTagToDisplay(brandTag: string): string {
  const label = brandTag
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
  return label ? `/${label}/` : "/Brand/";
}

function normalizeCategory(raw: string | null | undefined): ProductCategory {
  const value = (raw ?? "sneakers").trim().toLowerCase();
  return isStoreCategory(value) ? value : "sneakers";
}

function collectGalleryUrls(row: Record<string, unknown>): string[] {
  const urls = imageFieldsToArray(readImageFieldsFromRow(row));
  return urls.length > 0 ? urls : [PLACEHOLDER_IMAGE];
}

function normalizeFulfillmentType(value: unknown): ProductFulfillmentType {
  return value === "pre_order" ? "pre_order" : "in_stock";
}

export function mapDbProductToDetail(row: Record<string, unknown>): ProductDetail {
  const id = String(row.id ?? row.product_id ?? "").trim();
  if (!id) {
    throw new Error("Product row missing id");
  }

  const category = normalizeCategory(
    row.category == null ? undefined : String(row.category),
  );
  const { stock, sizes, sizeStock } = mapSizesForStorefront(
    category,
    row.sizes,
  );
  const images = collectGalleryUrls(row);
  const basePrice = Number(row.price) || 0;
  const rawSalePercent = Number(row.sale_percent ?? 0) || 0;
  const salePercent = Math.max(0, Math.min(50, rawSalePercent));

  const hasSale = salePercent > 0;
  const salePrice = hasSale
    ? Math.round(basePrice * (1 - salePercent / 100))
    : basePrice;
  const name = String(row.name ?? "Product");
  const brandTag = String(row.brand_tag ?? row.brand ?? "stusport");

  return {
    id,
    productCode:
      row.product_code == null || String(row.product_code).trim() === ""
        ? null
        : String(row.product_code).trim(),
    images,
    imageAlt: name,
    brand: brandTagToDisplay(brandTag),
    name,
    price: formatPriceVnd(salePrice),
    oldPrice: hasSale ? formatPriceVnd(basePrice) : undefined,
    stock,
    fulfillmentType: normalizeFulfillmentType(row.fulfillment_type),
    sizes,
    sizeStock,
    category,
    description:
      (row.description == null ? "" : String(row.description)).trim() ||
      `Authentic ${name}. High quality, perfect for sports and everyday streetwear.`,
  };
}
