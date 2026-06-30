import type { ProductCategory } from "./types";

export type { ProductCategory, ProductDetail } from "./types";

export {
  getAllProducts,
  getAllProductIds,
  getProductById,
  getProductsByCategory,
  getRelatedProductsByBrand,
  getProductStockMap,
  getStockForProduct,
  STORE_PRODUCTS_TAG,
} from "./products-data";
export type { ProductStockSnapshot } from "./products-data";

const CATEGORY_BACK: Record<ProductCategory, { href: string; label: string }> =
  {
    sneakers: { href: "/sneakers", label: "Sneakers" },
    sunglasses: { href: "/sunglasses", label: "Sunglasses" },
    clothing: { href: "/clothing", label: "Clothing" },
    bags: { href: "/bags", label: "Bags" },
    watches: { href: "/watches", label: "Watches" },
    stuclub: { href: "/stuclub", label: "STUClub" },
  };

export function getCategoryBackLink(category: ProductCategory): {
  href: string;
  label: string;
} {
  return CATEGORY_BACK[category];
}
