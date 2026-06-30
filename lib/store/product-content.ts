import { formatBrandDisplay } from "./brands";
import type { ProductDetail } from "./catalog";
import type { ProductCategory } from "./types";
import { STORE_NAME } from "./site";

export type ProductSpecRow = {
  label: string;
  value: string;
};

const CATEGORY_OCCASION: Record<ProductCategory, string> = {
  sneakers: "Casual, Training",
  sunglasses: "Casual, Travel",
  clothing: "Casual, Training",
  bags: "School, Work, Travel",
  watches: "Office, Fashion",
  stuclub: "Membership, Rewards",
};

const CATEGORY_SPORT: Record<ProductCategory, string> = {
  sneakers: "Running, Lifestyle",
  sunglasses: "Lifestyle",
  clothing: "Training, Lifestyle",
  bags: "Lifestyle",
  watches: "—",
  stuclub: "—",
};

function materialForCategory(category: ProductCategory): string {
  switch (category) {
    case "sneakers":
      return "Synthetic leather / Mesh";
    case "clothing":
      return "Cotton / Polyester";
    case "sunglasses":
      return "Acetate / Metal";
    case "bags":
      return "Polyester / PU Leather";
    case "watches":
      return "Stainless steel / Silicone";
    case "stuclub":
      return "Digital membership";
    default:
      return "Premium material";
  }
}

export function getProductSpecs(product: ProductDetail): ProductSpecRow[] {
  const brand = formatBrandDisplay(product.brand);
  const base: ProductSpecRow[] = [
    { label: "Brand", value: brand },
    { label: "Occasion", value: CATEGORY_OCCASION[product.category] },
    { label: "Category", value: product.category },
    { label: "Material", value: materialForCategory(product.category) },
  ];

  if (product.category === "clothing") {
    return [
      ...base,
      { label: "Sport", value: CATEGORY_SPORT[product.category] },
      { label: "Technology", value: "4-way stretch fabric" },
      {
        label: "Key Features",
        value: "Quick-dry, breathable, lightweight, stretchable",
      },
      { label: "Fit", value: "Regular fit" },
      { label: "Pattern", value: "Solid / Brand logo" },
    ];
  }

  if (product.category === "sneakers") {
    return [
      ...base,
      { label: "Sport", value: CATEGORY_SPORT[product.category] },
      { label: "Technology", value: "Soft cushion, good grip" },
      {
        label: "Key Features",
        value: "Breathable, lightweight, shape-retaining",
      },
      { label: "Fit", value: "Unisex" },
    ];
  }

  if (product.category === "watches") {
    return [
      ...base,
      { label: "Movement", value: "Quartz / Automatic" },
      { label: "Glass", value: "Scratch-resistant mineral glass" },
      { label: "Water resistance", value: "3ATM - 10ATM" },
    ];
  }

  return [
    ...base,
    { label: "Sport", value: CATEGORY_SPORT[product.category] },
    {
      label: "Key Features",
      value: "Authentic, durable, easy to style",
    },
  ];
}

export function getProductDetailBullets(product: ProductDetail): string[] {
  const brand = formatBrandDisplay(product.brand);
  return [
    `Authentic ${brand}, distributed by ${STORE_NAME}.`,
    "Premium material and finish, suitable for everyday use.",
    "Modern design, easy to pair with streetwear and sports style.",
    product.sizes
      ? `Available in multiple sizes: ${product.sizes.join(", ")}.`
      : "Limited quantity — order early to secure your preferred size/style.",
    `Product code: ${product.id.toUpperCase()}.`,
  ];
}

export const PRODUCT_RETURN_POLICY = `You may exchange size or style within 14 days of receiving your order (item must have original tags and be unused). ${STORE_NAME} offers free exchanges in-store or via our shipping partner. Special-discounted items or used products are not eligible for returns.`;

export const PRODUCT_CARE_GUIDE = `Hand wash or machine wash on gentle cycle with cold water; avoid harsh chemicals. Air dry in shade, away from direct sunlight. For shoes: clean with a damp cloth, avoid prolonged water soaking. For sunglasses: wipe with a microfiber cloth. For watches: avoid strong impacts and chemicals.`;

export const PRODUCT_STORAGE_GUIDE = `Store in a dry, cool place. Stuff shoes and bags with paper to retain shape. Watches should be kept in a separate box to avoid moisture damage.`;

export function getAboutStoreContent(): string {
  return `${STORE_NAME} is a sneaker, streetwear, and accessories store in Vietnam. We guarantee 100% authentic products, accurate size consultation, and transparent returns. Shop at ${STORE_NAME} for dedicated service and trend-forward collections.`;
}
