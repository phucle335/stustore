"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ProductCategory } from "@/lib/store/catalog";
import type { ProductDetail } from "@/lib/store/types";
import { ProductCard } from "@/components/store/ProductCard";
import styles from "@/styles/components/home/NewArrival.module.css";

type NewArrivalTab = {
  id: ProductCategory;
  label: string;
  href: string;
};

const NEW_ARRIVAL_TABS: NewArrivalTab[] = [
  { id: "sneakers", label: "SNEAKERS", href: "/sneakers" },
  { id: "clothing", label: "CLOTHING", href: "/clothing" },
  { id: "sunglasses", label: "SUNGLASSES", href: "/sunglasses" },
  { id: "watches", label: "WATCHES", href: "/watches" },
];

export function HomeNewArrivalClient() {
  const [activeTab, setActiveTab] = useState<ProductCategory>("sneakers");
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTab =
    NEW_ARRIVAL_TABS.find((tab) => tab.id === activeTab) ?? NEW_ARRIVAL_TABS[0];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/new-arrival?category=${activeTab}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeTab]);

  const topRowProducts = products.slice(0, 5);
  const bottomRowProducts = products.slice(5, 10);

  return (
    <section data-new-arrival className={styles.newArrival}>
      <div className={styles.header}>
        <h2 className={styles.title}>NEW ARRIVALS</h2>
        <p className={styles.subtitle}>
          
        </p>
      </div>

      <div className={styles.tabMenu}>
        {NEW_ARRIVAL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${tab.id === activeTab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.emptyState}>Dang tai san pham...</p>
      ) : products.length === 0 ? (
        <p className={styles.emptyState}>Chua co san pham nao trong danh muc nay.</p>
      ) : (
        <>
          <div className={styles.productGrid}>
            <div className={styles.productRow}>
              {topRowProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showSaleBadge
                  lightSurface
                />
              ))}
            </div>
            <div className={styles.productRow}>
              {bottomRowProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showSaleBadge
                  lightSurface
                />
              ))}
            </div>
          </div>

          <div className={styles.viewAll}>
            <Link href={currentTab.href} className={styles.viewAllLink}>
              VIEW ALL {currentTab.label.toLowerCase()}
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
