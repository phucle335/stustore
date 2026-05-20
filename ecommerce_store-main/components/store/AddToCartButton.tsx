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
};

export function AddToCartButton({
  product,
  size,
  stock,
  lineId,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const isOutOfStock = stock <= 0;
  const isDisabled = isOutOfStock || disabled;

  const handleClick = (): void => {
    const added = addItem({
      lineId,
      productId: product.id,
      ...(size !== undefined ? { size } : {}),
      name: product.name,
      brand: product.brand,
      image: getPrimaryImage(product.images),
      imageAlt: product.imageAlt,
      price: product.price,
      oldPrice: product.oldPrice,
    });

    if (added) {
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
      {isOutOfStock
        ? size
          ? `Size ${size} hết hàng`
          : "Hết hàng"
        : disabled && size === undefined
          ? "Chọn size"
          : "MUA NGAY"}
    </button>
  );
}
