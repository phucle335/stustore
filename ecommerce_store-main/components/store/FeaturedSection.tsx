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
  const brands = useMemo(() => getUniqueBrands(products), [products]);
  const filteredProducts = useMemo(
    () => filterProductsByBrand(products, activeBrand),
    [products, activeBrand],
  );

  return (
    <section className="featured">
      <h2 className="section-title">{title}</h2>
      <BrandFilterBar
        brands={brands}
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand}
      />
      <ProductGrid products={filteredProducts} pageSize={pageSize} />
    </section>
  );
}
