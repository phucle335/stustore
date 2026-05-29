"use client";

import { formatBrandDisplay } from "@/lib/store/brands";
import styles from "@/styles/components/store/FeaturedSection.module.css";

type BrandFilterBarProps = {
  brands: string[];
  activeBrand: string | null;
  onBrandChange: (brand: string | null) => void;
};

export function BrandFilterBar({
  brands,
  activeBrand,
  onBrandChange,
}: BrandFilterBarProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <nav className={styles.brandFilter} aria-label="Lọc theo thương hiệu">
      <button
        type="button"
        className={activeBrand === null ? styles.active : undefined}
        onClick={() => onBrandChange(null)}
      >
        Tất cả
      </button>
      {brands.map((brand) => (
        <button
          key={brand}
          type="button"
          className={activeBrand === brand ? styles.active : undefined}
          onClick={() => onBrandChange(brand)}
        >
          {formatBrandDisplay(brand)}
        </button>
      ))}
    </nav>
  );
}
