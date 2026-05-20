"use client";

import { useState } from "react";
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
    <div className="support-layout">
      <aside className="support-sidebar">
        <p className="support-sidebar-heading">Hỗ trợ</p>
        <ul className="support-sidebar-list">
          {SUPPORT_CATEGORIES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  item.id === activeCategory ? "active" : undefined
                }
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

      <div className="support-faq">
        {category.items.map((item) => {
          const isOpen = openItemId === item.id;
          return (
            <div
              key={item.id}
              className={`support-faq-item${isOpen ? " open" : ""}`}
            >
              <button
                type="button"
                className="support-faq-question"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenItemId(isOpen ? null : item.id)
                }
              >
                {item.question}
                <i
                  className={`fas fa-chevron-${isOpen ? "up" : "right"}`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div className="support-faq-answer">
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
