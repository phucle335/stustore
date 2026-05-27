"use client";

import { useMemo, useState } from "react";
import {
  filterProductsByBrand,
  getUniqueBrands,
} from "@/lib/store/brands";
import type { Product } from "@/lib/store/types";
import { BrandFilterBar } from "./BrandFilterBar";
import { ProductGrid } from "./ProductGrid";

type FeaturedSectionProps = {
  title: string;
  products: Product[];
  pageSize?: number;
};

export function FeaturedSection({
  title,
  products,
  pageSize,
}: FeaturedSectionProps) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<
    "all" | "in_stock" | "pre_order"
  >("all");
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

  return (
    <section className="featured">
      <h2 className="section-title">{title}</h2>
      <BrandFilterBar
        brands={brands}
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand}
      />
      <label className="featured-fulfillment-filter">
        <span>Lọc trạng thái</span>
        <select
          value={fulfillmentFilter}
          onChange={(event) =>
            setFulfillmentFilter(
              event.target.value as "all" | "in_stock" | "pre_order",
            )
          }
        >
          <option value="all">Tất cả</option>
          <option value="in_stock">Hàng có sẵn</option>
          <option value="pre_order">Pre-order</option>
        </select>
      </label>
      {filteredProducts.length === 0 ? (
        <p className="search-empty">
          Chưa có sản phẩm trong danh mục này. Thêm sản phẩm trong Admin và chọn
          đúng danh mục.
        </p>
      ) : (
        <ProductGrid products={filteredProducts} pageSize={pageSize} />
      )}
    </section>
  );
}
