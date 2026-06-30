"use client";

import styles from "@/styles/components/store/ProductDetail.module.css";

type ProductVariantPickerProps = {
  sizes?: string[];
  sizeStock?: Record<string, number>;
  selectedSize?: string;
  onSizeChange: (size: string) => void;
};

export function ProductVariantPicker({
  sizes,
  sizeStock,
  selectedSize,
  onSizeChange,
}: ProductVariantPickerProps) {
  const hasSizes = sizes !== undefined && sizes.length > 0;

  if (!hasSizes) {
    return null;
  }

  return (
    <div className={styles.productVariants}>
      <fieldset className={styles.productVariantGroup}>
        <legend className={styles.productVariantLabel}>Size</legend>
        <div
          className={styles.productVariantOptions}
          role="group"
          aria-label="Select size"
        >
          {sizes.map((size) => {
            const qty = sizeStock?.[size];
            const isOutOfStock = qty !== undefined && qty <= 0;

            return (
              <button
                key={size}
                type="button"
                className={`${styles.productVariantBtn} ${styles.productVariantBtnSize}${selectedSize === size ? ` ${styles.selected}` : ""}${isOutOfStock ? ` ${styles.outOfStock}` : ""}`}
                aria-pressed={selectedSize === size}
                disabled={isOutOfStock}
                onClick={() => onSizeChange(size)}
              >
                {size}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
