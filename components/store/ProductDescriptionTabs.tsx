"use client";

import { useState } from "react";
import { formatBrandDisplay } from "@/lib/store/brands";
import type { ProductDetail } from "@/lib/store/catalog";
import styles from "@/styles/components/store/ProductDetail.module.css";

type TabId = "description" | "reviews";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Mô tả sản phẩm" },
  { id: "reviews", label: "Đánh giá (0)" },
];

type ProductDescriptionTabsProps = {
  product: ProductDetail;
};

export function ProductDescriptionTabs({ product }: ProductDescriptionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const brandLabel = formatBrandDisplay(product.brand);

  // Tách description thành các đoạn (hỗ trợ \n hoặc \n\n từ DB)
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
      aria-label="Thông tin sản phẩm"
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
              <p className={styles.productDetailSku}>Chưa có mô tả sản phẩm.</p>
            )}

            <p className={styles.productDetailMeta}>
              Thương hiệu: <strong>{brandLabel}</strong>
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
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
