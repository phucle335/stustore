"use client";



import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  filterProductsByBrand,
  getUniqueBrands,
} from "@/lib/store/brands";
import type { Product } from "@/lib/store/types";
import { BrandFilterBar } from "./BrandFilterBar";
import { ProductGrid } from "./ProductGrid";
import staticStyles from "@/styles/components/store/StoreStatic.module.css";
import styles from "@/styles/components/store/FeaturedSection.module.css";

type FeaturedSectionProps = {
  title: string;
  products: Product[];
  pageSize?: number;
  initialSort?: ProductSort;
};

export type ProductSort = "price_desc" | "price_asc" | "name_asc" | "name_desc";

function parsePrice(value: string): number {
  const raw = String(value ?? "");
  const digits = raw.replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

export function FeaturedSection({
  title,
  products,
  pageSize,
  initialSort = "price_desc",
}: FeaturedSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<
    "all" | "in_stock" | "pre_order"
  >("all");
  const [sort, setSort] = useState<ProductSort>(initialSort);
  const brands = useMemo(() => getUniqueBrands(products), [products]);
  const filteredByBrand = useMemo(
    () => filterProductsByBrand(products, activeBrand),
    [products, activeBrand],
  );
  const filteredProducts = useMemo(() => {
    if (fulfillmentFilter === "all") {
      return filteredByBrand;
    }
    return filteredByBrand.filter(
      (product) => product.fulfillmentType === fulfillmentFilter,
    );
  }, [filteredByBrand, fulfillmentFilter]);

  const sortedProducts = useMemo(() => {
    const rows = [...filteredProducts];
    rows.sort((a, b) => {
      if (sort === "price_asc") return parsePrice(a.price) - parsePrice(b.price);
      if (sort === "price_desc") return parsePrice(b.price) - parsePrice(a.price);
      if (sort === "name_asc") return a.name.localeCompare(b.name, "vi");
      if (sort === "name_desc") return b.name.localeCompare(a.name, "vi");
      return 0;
    });
    return rows;
  }, [filteredProducts, sort]);

  function updateSort(next: ProductSort) {
    setSort(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <section className={styles.featured}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <BrandFilterBar
        brands={brands}
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand}
      />
      <div className={styles.featuredControls}>
        <label className={styles.featuredFulfillmentFilter}>
          <span>Filter by status</span>
          <select
            value={fulfillmentFilter}
            onChange={(event) =>
              setFulfillmentFilter(
                event.target.value as "all" | "in_stock" | "pre_order",
              )
            }
          >
            <option value="all">All</option>
            <option value="in_stock">In stock</option>
            <option value="pre_order">Pre-order</option>
          </select>
        </label>

        <label className={styles.featuredFulfillmentFilter}>
          <span>Sort by</span>
          <select value={sort} onChange={(e) => updateSort(e.target.value as ProductSort)}>
            <option value="price_desc">Price: high → low</option>
            <option value="price_asc">Price: low → high</option>
            <option value="name_asc">Name: A → Z</option>
            <option value="name_desc">Name: Z → A</option>
          </select>
        </label>
      </div>
      {filteredProducts.length === 0 ? (
        <p className={staticStyles.searchEmpty}>
          No products in this category yet. Add products in Admin and select
          the correct category.
        </p>
      ) : (
        <ProductGrid products={sortedProducts} pageSize={pageSize} />
      )}
    </section>
  );
}
