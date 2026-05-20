import {
  BAGS_PRODUCTS,
  CLOTHING_PRODUCTS,
  PERFUME_PRODUCTS,
  SANDALS_PRODUCTS,
  SNEAKER_PRODUCTS,
  SUNGLASSES_PRODUCTS,
  WATCHES_PRODUCTS,
} from "./products";
import { getStockForProduct } from "./stock";
import type { Product, ProductCategory } from "./types";

export type { ProductCategory };

export type ProductDetail = Product & {
  category: ProductCategory;
  description: string;
};

const CATEGORY_BACK: Record<ProductCategory, { href: string; label: string }> =
  {
  sneakers: { href: "/sneakers", label: "Giày Sneaker" },
  sunglasses: { href: "/sunglasses", label: "Sunglasses" },
  sandals: { href: "/sandals", label: "Dép" },
  clothing: { href: "/clothing", label: "Quần Áo" },
  bags: { href: "/bags", label: "Túi Xách" },
  perfume: { href: "/perfume", label: "Nước Hoa" },
  watches: { href: "/watches", label: "Đồng Hồ" },
};

function withCategory(
  products: Product[],
  category: ProductCategory,
): ProductDetail[] {
  return products.map((product) => ({
    ...product,
    category,
    description: `Sản phẩm chính hãng ${product.name}. Chất lượng cao, phù hợp phong cách thể thao và streetwear hàng ngày.`,
  }));
}

const ALL_PRODUCTS: ProductDetail[] = [
  ...withCategory(SNEAKER_PRODUCTS, "sneakers"),
  ...withCategory(SUNGLASSES_PRODUCTS, "sunglasses"),
  ...withCategory(SANDALS_PRODUCTS, "sandals"),
  ...withCategory(CLOTHING_PRODUCTS, "clothing"),
  ...withCategory(BAGS_PRODUCTS, "bags"),
  ...withCategory(PERFUME_PRODUCTS, "perfume"),
  ...withCategory(WATCHES_PRODUCTS, "watches"),
];

export function getAllProducts(): ProductDetail[] {
  return ALL_PRODUCTS;
}

export function getAllProductIds(): string[] {
  return ALL_PRODUCTS.map((product) => product.id);
}

export function getProductById(id: string): ProductDetail | undefined {
  return ALL_PRODUCTS.find((product) => product.id === id);
}

export function getProductStock(productId: string, size?: string): number {
  return getStockForProduct(getProductById(productId), size);
}

export function getCategoryBackLink(category: ProductCategory): {
  href: string;
  label: string;
} {
  return CATEGORY_BACK[category];
}

export function getRelatedProductsByBrand(
  productId: string,
  brand: string,
  limit = 8,
): ProductDetail[] {
  return ALL_PRODUCTS.filter(
    (product) => product.brand === brand && product.id !== productId,
  ).slice(0, limit);
}
