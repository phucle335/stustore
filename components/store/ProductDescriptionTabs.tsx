"use client";

import { useState } from "react";
import { formatBrandDisplay } from "@/lib/store/brands";
import type { ProductDetail } from "@/lib/store/catalog";
import styles from "@/styles/components/store/ProductDetail.module.css";

type TabId = "description" | "reviews";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Product Description" },
  { id: "reviews", label: "Reviews (0)" },
];

type ProductDescriptionTabsProps = {
  product: ProductDetail;
};

export function ProductDescriptionTabs({ product }: ProductDescriptionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const brandLabel = formatBrandDisplay(product.brand);

  // Split description into paragraphs (supports \n or \n\n from DB)
  const descriptionParagraphs = product.description
    ? product.description
        .split(/\n\n|\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <section
      className={styles.productDetailPanel}
      id="product-description"
      aria-label="Product information"
    >
      <div className={styles.productDetailTabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={activeTab === tab.id ? styles.active : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.productDetailTabPanels}>
        {activeTab === "description" ? (
          <div
            id="panel-description"
            role="tabpanel"
            aria-labelledby="tab-description"
            className={`${styles.productDetailProse}`}
          >
            <h3 className={styles.productDetailProseTitle}>
              {product.name.toUpperCase()}
            </h3>

            {descriptionParagraphs.length > 0 ? (
              descriptionParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))
            ) : (
              <p className={styles.productDetailSku}>No product description yet.</p>
            )}

            <p className={styles.productDetailMeta}>
              Brand: <strong>{brandLabel}</strong>
            </p>
          </div>
        ) : null}

        {activeTab === "reviews" ? (
          <div
            id="panel-reviews"
            role="tabpanel"
            aria-labelledby="tab-reviews"
            className={styles.productDetailTabPanelProse}
          >
            <p>No reviews yet for this product.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
