"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { ProductCategory } from "@/lib/store/catalog";
import {
  CLOTHING_PRODUCTS,
  PERFUME_PRODUCTS,
  SNEAKER_PRODUCTS,
  SUNGLASSES_PRODUCTS,
  WATCHES_PRODUCTS,
} from "@/lib/store/products";
import type { Product } from "@/lib/store/types";

type FeaturedTab = {
  id: ProductCategory;
  label: string;
  products: Product[];
};

const FEATURED_TABS: FeaturedTab[] = [
  { id: "sneakers", label: "SNEAKER", products: SNEAKER_PRODUCTS },
  { id: "clothing", label: "CLOTHES", products: CLOTHING_PRODUCTS },
  { id: "sunglasses", label: "SUNGLASSES", products: SUNGLASSES_PRODUCTS },
  { id: "perfume", label: "PERFUME", products: PERFUME_PRODUCTS },
  { id: "watches", label: "WATCHES", products: WATCHES_PRODUCTS },
];

export function HomeFeatured() {
  const [activeTab, setActiveTab] = useState<ProductCategory>("sneakers");
  const currentTab =
    FEATURED_TABS.find((tab) => tab.id === activeTab) ?? FEATURED_TABS[0];

  return (
    <section className="featured home-featured">
      <h2 className="section-title home-trending-title">TRENDING</h2>

      <div className="tab-menu home-tab-menu home-trending-tabs">
        {FEATURED_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "active" : undefined}
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
