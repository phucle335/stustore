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
import styles from "@/styles/components/store/ProductDetail.module.css";

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
      {selectedStock <= 5 ? (
        <p
          className={`${styles.productStock}${selectedStock <= 0 ? ` ${styles.out}` : ` ${styles.low}`}`}
        >
          {formatStockLabel(selectedStock, selectedSize)}
        </p>
      ) : null}
      <div className={styles.productQtyRow}>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className={styles.productQtyBtn}
          aria-label="Giảm số lượng"
        >
          -
        </button>
        <span className={styles.productQtyValue}>{quantity}</span>
        <button
          type="button"
          onClick={() =>
            setQuantity((q) => Math.min(Math.max(1, selectedStock), q + 1))
          }
          className={styles.productQtyBtn}
          aria-label="Tăng số lượng"
        >
          +
        </button>
      </div>
      <div className={styles.productCtaStack}>
      <button
        type="button"
        className={`${styles.productDetailAddBtn} ${styles.productDetailAddBtnPrimary}`}
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
        className={`${styles.productDetailAddBtn} ${styles.productDetailAddBtnSecondary}`}
      />
      </div>
      <ProductPurchasePolicies />
    </>
  );
}
