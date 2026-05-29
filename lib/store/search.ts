import { formatBrandDisplay } from "./brands";
import type { ProductDetail } from "./catalog";
import { NAV_LINKS } from "./navigation";
import type { ProductCategory } from "./types";

const CATEGORY_ALIASES: Record<ProductCategory, readonly string[]> = {
  sneakers: ["sneaker", "sneakers", "giày", "giay", "shoe", "shoes"],
  clothing: ["clothes", "clothing", "quần", "quan", "áo", "ao", "apparel"],
  sunglasses: ["sunglasses", "sunglass", "kính", "kinh", "eyewear", "glasses"],
  watches: ["watch", "watches", "đồng hồ", "dong ho", "timepiece"],
  bags: ["bag", "bags", "túi", "tui", "handbag"],
};

const CATEGORY_BACK_LABELS: Record<ProductCategory, string> = {
  sneakers: "Giày Sneaker",
  clothing: "Quần Áo",
  sunglasses: "Sunglasses",
  bags: "Túi Xách",
  watches: "Đồng Hồ",
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
