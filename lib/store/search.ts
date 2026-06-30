import { formatBrandDisplay } from "./brands";
import type { ProductDetail } from "./catalog";
import { NAV_LINKS } from "./navigation";
import type { ProductCategory } from "./types";

const CATEGORY_ALIASES: Record<ProductCategory, readonly string[]> = {
  sneakers: ["sneaker", "sneakers", "shoe", "shoes"],
  clothing: ["clothes", "clothing", "top", "bottom", "dress", "apparel"],
  sunglasses: ["sunglasses", "sunglass", "eyewear", "glasses", "spectacles"],
  watches: ["watch", "watches", "wristwatch", "timepiece"],
  bags: ["bag", "bags", "handbag", "backpack", "purse"],
  stuclub: ["stuclub", "club", "loyalty", "membership"],
};

const CATEGORY_BACK_LABELS: Record<ProductCategory, string> = {
  sneakers: "Sneakers",
  clothing: "Clothing",
  sunglasses: "Sunglasses",
  bags: "Bags",
  watches: "Watches",
  stuclub: "STUClub",
};

function getNavLabelForCategory(category: ProductCategory): string | undefined {
  const link = NAV_LINKS.find((item) => item.id === category);
  return link?.label;
}

export function getProductSearchHaystack(product: ProductDetail): string {
  const brandLabel = formatBrandDisplay(product.brand).toLowerCase();
  const parts = [
    product.name,
    product.id,
    product.brand,
    brandLabel,
    product.category,
    CATEGORY_BACK_LABELS[product.category],
    getNavLabelForCategory(product.category),
    ...CATEGORY_ALIASES[product.category],
  ];

  return parts
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ")
    .toLowerCase();
}

export function searchProducts(
  products: ProductDetail[],
  query: string,
): ProductDetail[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return [];
  }

  return products.filter((product) =>
    getProductSearchHaystack(product).includes(normalized),
  );
}
