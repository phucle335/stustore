"use client";

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
    <div className="product-variants">
      <fieldset className="product-variant-group">
        <legend className="product-variant-label">Size</legend>
        <div
          className="product-variant-options"
          role="group"
          aria-label="Chọn size"
        >
          {sizes.map((size) => {
            const qty = sizeStock?.[size];
            const isOutOfStock = qty !== undefined && qty <= 0;

            return (
              <button
                key={size}
                type="button"
                className={`product-variant-btn product-variant-btn--size${selectedSize === size ? " selected" : ""}${isOutOfStock ? " out-of-stock" : ""}`}
                aria-pressed={selectedSize === size}
                disabled={isOutOfStock}
                onClick={() => onSizeChange(size)}
              >
                {size}
                {qty !== undefined ? (
                  <span className="product-variant-stock"> ({qty})</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
