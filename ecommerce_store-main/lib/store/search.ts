import { formatBrandDisplay } from "./brands";
import type { ProductDetail } from "./catalog";

export function searchProducts(
  products: ProductDetail[],
  query: string,
): ProductDetail[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return [];
  }

  return products.filter((product) => {
    const brandLabel = formatBrandDisplay(product.brand).toLowerCase();
    return (
      product.name.toLowerCase().includes(normalized) ||
      product.id.toLowerCase().includes(normalized) ||
      brandLabel.includes(normalized) ||
      product.brand.toLowerCase().includes(normalized)
    );
  });
}
