"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductCategory } from "@/lib/store/catalog";
import {
  CLOTHING_PRODUCTS,
  SNEAKER_PRODUCTS,
  SUNGLASSES_PRODUCTS,
  WATCHES_PRODUCTS,
} from "@/lib/store/products";
import type { Product } from "@/lib/store/types";
import featuredStyles from "@/styles/components/store/FeaturedSection.module.css";
import styles from "@/styles/components/home/HomeLegacy.module.css";

type FeaturedTab = {
  id: ProductCategory;
  label: string;
  products: Product[];
};

const FEATURED_TABS: FeaturedTab[] = [
  { id: "sneakers", label: "SNEAKER", products: SNEAKER_PRODUCTS },
  { id: "clothing", label: "CLOTHES", products: CLOTHING_PRODUCTS },
  { id: "sunglasses", label: "SUNGLASSES", products: SUNGLASSES_PRODUCTS },
  { id: "watches", label: "WATCHES", products: WATCHES_PRODUCTS },
];

export function HomeFeatured() {
  const [activeTab, setActiveTab] = useState<ProductCategory>("sneakers");
  const currentTab =
    FEATURED_TABS.find((tab) => tab.id === activeTab) ?? FEATURED_TABS[0];

  return (
    <section className={`${featuredStyles.featured} ${styles.homeFeatured}`}>
      <h2 className={`${featuredStyles.sectionTitle} ${styles.homeTrendingTitle}`}>
        TRENDING
      </h2>

      <div
        className={`${featuredStyles.tabMenu} ${styles.homeTrendingTabs}`}
      >
        {FEATURED_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? styles.active : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ProductGrid
        key={currentTab.id}
        products={currentTab.products}
        pageSize={8}
        showRating
        showSaleBadge
      />
    </section>
  );
}
