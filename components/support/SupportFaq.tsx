"use client";

import { useState } from "react";
import styles from "@/styles/components/store/StoreStatic.module.css";
import {
  SUPPORT_CATEGORIES,
  type SupportCategoryId,
} from "@/lib/store/support-content";

export function SupportFaq() {
  const [activeCategory, setActiveCategory] =
    useState<SupportCategoryId>("ordering");
  const [openItemId, setOpenItemId] = useState<string | null>("order-how");

  const category =
    SUPPORT_CATEGORIES.find((item) => item.id === activeCategory) ??
    SUPPORT_CATEGORIES[0];

  return (
    <div className={styles.supportLayout}>
      <aside>
        <p className={styles.supportSidebarHeading}>Support</p>
        <ul className={styles.supportSidebarList}>
          {SUPPORT_CATEGORIES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={item.id === activeCategory ? styles.active : undefined}
                onClick={() => {
                  setActiveCategory(item.id);
                  setOpenItemId(item.items[0]?.id ?? null);
                }}
              >
                <i className={`fas ${item.icon}`} aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className={styles.supportFaq}>
        {category.items.map((item) => {
          const isOpen = openItemId === item.id;
          return (
            <div
              key={item.id}
              className={`${styles.supportFaqItem}${isOpen ? ` ${styles.supportFaqItemIsOpen}` : ""}`}
            >
              <button
                type="button"
                className={styles.supportFaqQuestion}
                aria-expanded={isOpen}
                onClick={() => setOpenItemId(isOpen ? null : item.id)}
              >
                {item.question}
                <i
                  className={`fas fa-chevron-${isOpen ? "up" : "right"}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div className={styles.supportFaqAnswer}>
                  <p>{item.answer}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
