"use client";

import { useState } from "react";
import { formatBrandDisplay } from "@/lib/store/brands";
import type { ProductDetail } from "@/lib/store/catalog";
import {
  PRODUCT_CARE_GUIDE,
  PRODUCT_RETURN_POLICY,
  PRODUCT_STORAGE_GUIDE,
  getAboutStoreContent,
} from "@/lib/store/product-content";
import { STORE_NAME } from "@/lib/store/site";

type TabId = "description" | "returns" | "care" | "storage" | "about";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Mô tả sản phẩm" },
  { id: "returns", label: "Quy định đổi trả" },
  { id: "care", label: "Hướng dẫn chăm sóc" },
  { id: "storage", label: "Hướng dẫn bảo quản" },
  { id: "about", label: `Về ${STORE_NAME}` },
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
      className="product-detail-panel"
      id="product-description"
      aria-label="Thông tin sản phẩm"
    >
      <div className="product-detail-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={activeTab === tab.id ? "active" : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="product-detail-tab-panels">
        {activeTab === "description" ? (
          <div
            id="panel-description"
            role="tabpanel"
            aria-labelledby="tab-description"
            className="product-detail-tab-panel product-detail-prose"
          >
            <h3 className="product-detail-prose-title">
              {product.name.toUpperCase()}
            </h3>

            {descriptionParagraphs.length > 0 ? (
              descriptionParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))
            ) : (
              <p className="product-detail-sku">Chưa có mô tả sản phẩm.</p>
            )}

            <p className="product-detail-sku">
              Thương hiệu: <strong>{brandLabel}</strong> · Mã:{" "}
              <strong>{product.id}</strong>
            </p>
          </div>
        ) : null}

        {activeTab === "returns" ? (
          <div
            id="panel-returns"
            role="tabpanel"
            className="product-detail-tab-panel product-detail-tab-panel--prose"
          >
            <p>{PRODUCT_RETURN_POLICY}</p>
          </div>
        ) : null}

        {activeTab === "care" ? (
          <div
            id="panel-care"
            role="tabpanel"
            className="product-detail-tab-panel product-detail-tab-panel--prose"
          >
            <p>{PRODUCT_CARE_GUIDE}</p>
          </div>
        ) : null}

        {activeTab === "storage" ? (
          <div
            id="panel-storage"
            role="tabpanel"
            className="product-detail-tab-panel product-detail-tab-panel--prose"
          >
            <p>{PRODUCT_STORAGE_GUIDE}</p>
          </div>
        ) : null}

        {activeTab === "about" ? (
          <div
            id="product-about"
            role="tabpanel"
            className="product-detail-tab-panel product-detail-tab-panel--prose"
          >
            <p>{getAboutStoreContent()}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
