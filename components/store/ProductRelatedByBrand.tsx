import Link from "next/link";
import { formatBrandDisplay } from "@/lib/store/brands";
import type { Product } from "@/lib/store/types";
import { ProductGrid } from "./ProductGrid";
import styles from "@/styles/components/store/ProductDetail.module.css";

type ProductRelatedByBrandProps = {
  brand: string;
  categoryHref: string;
  products: Product[];
};

export function ProductRelatedByBrand({
  brand,
  categoryHref,
  products,
}: ProductRelatedByBrandProps) {
  if (products.length === 0) {
    return null;
  }

  const brandLabel = formatBrandDisplay(brand);

  return (
    <section
      className={`${styles.productDetailPanel} ${styles.productRelated}`}
      aria-label="Sản phẩm cùng thương hiệu"
    >
      <h2 className={styles.productRelatedTitle}>
        Bạn có thể thích — {brandLabel}
      </h2>
      <ProductGrid products={products} pageSize={4} lightSurface />
      <p className={styles.productRelatedMore}>
        <Link href={categoryHref}>Xem thêm sản phẩm</Link>
      </p>
    </section>
  );
}
