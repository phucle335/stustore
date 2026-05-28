"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDetail } from "@/lib/store/catalog";
import { isCategoryWithoutSizes } from "@/lib/store/product-category-rules";
import { buildCartLineId } from "@/lib/store/cart";
import { formatStockLabel, getStockForProduct } from "@/lib/store/stock";
import { getPrimaryImage } from "@/lib/store/product-images";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPurchasePolicies } from "./ProductPurchasePolicies";
import { ProductVariantPicker } from "./ProductVariantPicker";
import { useCart } from "./CartProvider";

type ProductPurchaseBlockProps = {
  product: ProductDetail;
};

function firstAvailableSize(
  sizes: string[],
  sizeStock?: Record<string, number>,
): string | undefined {
  if (sizeStock === undefined) {
    return sizes[0];
  }

  return sizes.find((size) => (sizeStock[size] ?? 0) > 0);
}

export function ProductPurchaseBlock({ product }: ProductPurchaseBlockProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const hasSizes =
    !isCategoryWithoutSizes(product.category) &&
    product.sizes !== undefined &&
    product.sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(() =>
    hasSizes
      ? firstAvailableSize(product.sizes!, product.sizeStock) ?? product.sizes![0]
      : undefined,
  );

  const selectedStock = useMemo(
    () => getStockForProduct(product, selectedSize),
    [product, selectedSize],
  );
  const [quantity, setQuantity] = useState(1);

  const requiresSize = hasSizes;
  const canAdd =
    (!requiresSize || selectedSize !== undefined) &&
    selectedStock > 0 &&
    quantity <= selectedStock;
  const stockClass =
    selectedStock <= 0 ? " out" : selectedStock <= 5 ? " low" : "";

  return (
    <>
      {hasSizes ? (
        <ProductVariantPicker
          sizes={product.sizes}
          sizeStock={product.sizeStock}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
        />
      ) : null}
      <p className={`product-stock${stockClass}`}>
        {formatStockLabel(selectedStock, selectedSize)}
      </p>
      <div className="product-qty-row">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="product-qty-btn"
          aria-label="Giảm số lượng"
        >
          -
        </button>
        <span className="product-qty-value">{quantity}</span>
        <button
          type="button"
          onClick={() =>
            setQuantity((q) => Math.min(Math.max(1, selectedStock), q + 1))
          }
          className="product-qty-btn"
          aria-label="Tăng số lượng"
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="product-detail-add-btn"
        onClick={() => {
          let added = false;
          for (let i = 0; i < quantity; i += 1) {
            const ok = addItem({
              lineId: buildCartLineId(product.id, undefined, selectedSize),
              productId: product.id,
              ...(selectedSize !== undefined ? { size: selectedSize } : {}),
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
          if (added) {
            router.push("/checkout");
          }
        }}
        disabled={!canAdd}
      >
        MUA NGAY
      </button>
      <AddToCartButton
        product={product}
        size={selectedSize}
        stock={selectedStock}
        lineId={buildCartLineId(product.id, undefined, selectedSize)}
        quantity={quantity}
        label="Thêm vào giỏ hàng"
        openOnAdd={false}
        disabled={!canAdd}
      />
      <ProductPurchasePolicies />
    </>
  );
}
