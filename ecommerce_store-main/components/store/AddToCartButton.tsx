"use client";

import type { ProductDetail } from "@/lib/store/catalog";
import { getPrimaryImage } from "@/lib/store/product-images";
import { useCart } from "./CartProvider";

type AddToCartButtonProps = {
  product: ProductDetail;
  size?: string;
  stock: number;
  lineId: string;
  disabled?: boolean;
  label?: string;
  openOnAdd?: boolean;
  quantity?: number;
};

export function AddToCartButton({
  product,
  size,
  stock,
  lineId,
  disabled = false,
  label,
  openOnAdd = true,
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const isOutOfStock = stock <= 0;
  const isDisabled = isOutOfStock || disabled;

  const handleClick = (): void => {
    let added = false;
    for (let i = 0; i < quantity; i += 1) {
      const ok = addItem({
        lineId,
        productId: product.id,
        ...(size !== undefined ? { size } : {}),
        name: product.name,
        brand: product.brand,
        image: getPrimaryImage(product.images),
        imageAlt: product.imageAlt,
        price: product.price,
        oldPrice: product.oldPrice,
        fulfillmentType: product.fulfillmentType,
      });
      if (!ok) break;
      added = true;
    }

    if (added && openOnAdd) {
      openCart();
    }
  };

  return (
    <button
      type="button"
      className="product-detail-add-btn"
      onClick={handleClick}
      disabled={isDisabled}
    >
      <i className="fas fa-shopping-bag" aria-hidden="true" />
      {label ??
        (isOutOfStock
        ? size
          ? `Size ${size} hết hàng`
          : "Hết hàng"
        : disabled && size === undefined
          ? "Chọn size"
          : "MUA NGAY")}
    </button>
  );
}
