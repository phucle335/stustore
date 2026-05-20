import { formatBrandDisplay } from "@/lib/store/brands";
import type { Product } from "@/lib/store/types";
import { ProductGrid } from "./ProductGrid";

type ProductRelatedByBrandProps = {
  brand: string;
  products: Product[];
};

export function ProductRelatedByBrand({
  brand,
  products,
}: ProductRelatedByBrandProps) {
  if (products.length === 0) {
    return null;
  }

  const brandLabel = formatBrandDisplay(brand);

  return (
    <section
      className="product-detail-panel product-related"
      aria-label="Sản phẩm cùng thương hiệu"
    >
      <h2 className="product-related-title">
        Bạn có thể thích · {brandLabel}
      </h2>
      <ProductGrid products={products} pageSize={8} />
    </section>
  );
}
