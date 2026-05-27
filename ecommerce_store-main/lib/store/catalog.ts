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
    sneakers: { href: "/sneakers", label: "Giày Sneaker" },
    sunglasses: { href: "/sunglasses", label: "Sunglasses" },
    clothing: { href: "/clothing", label: "Quần Áo" },
    bags: { href: "/bags", label: "Túi Xách" },
    watches: { href: "/watches", label: "Đồng Hồ" },
  };

export function getCategoryBackLink(category: ProductCategory): {
  href: string;
  label: string;
} {
  return CATEGORY_BACK[category];
}
