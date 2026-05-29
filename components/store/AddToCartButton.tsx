"use client";

import type { ProductDetail } from "@/lib/store/catalog";
import { getPrimaryImage } from "@/lib/store/product-images";
import { useCart } from "./CartProvider";
import styles from "@/styles/components/store/ProductDetail.module.css";

type AddToCartButtonProps = {
  product: ProductDetail;
  size?: string;
  stock: number;
  lineId: string;
  disabled?: boolean;
  label?: string;
  openOnAdd?: boolean;
  quantity?: number;
  className?: string;
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
  className,
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
      className={className ?? styles.productDetailAddBtn}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <i className="fas fa-shopping-cart" aria-hidden="true" />
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
