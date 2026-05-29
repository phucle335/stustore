import type { Product } from "./types";

/** "/Nike/" → "Nike" */
export function formatBrandDisplay(brand: string): string {
  return brand.replace(/^\/+|\/+$/g, "").trim();
}

export function getUniqueBrands(products: Product[]): string[] {
  const seen = new Set<string>();
  for (const product of products) {
    seen.add(product.brand);
  }
  return Array.from(seen).sort((a, b) =>
    formatBrandDisplay(a).localeCompare(formatBrandDisplay(b), "vi"),
  );
}

export function filterProductsByBrand(
  products: Product[],
  brand: string | null,
): Product[] {
  if (brand === null) {
    return products;
  }
  return products.filter((product) => product.brand === brand);
}
