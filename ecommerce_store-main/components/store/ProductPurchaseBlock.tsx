"use client";

import { useMemo, useState } from "react";
import type { ProductDetail } from "@/lib/store/catalog";
import { buildCartLineId } from "@/lib/store/cart";
import { formatStockLabel, getStockForProduct } from "@/lib/store/stock";
import { AddToCartButton } from "./AddToCartButton";
import { ProductPurchasePolicies } from "./ProductPurchasePolicies";
import { ProductVariantPicker } from "./ProductVariantPicker";

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
  const hasSizes = product.sizes !== undefined && product.sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(() =>
    hasSizes
      ? firstAvailableSize(product.sizes!, product.sizeStock) ?? product.sizes![0]
      : undefined,
  );

  const selectedStock = useMemo(
    () => getStockForProduct(product, selectedSize),
    [product, selectedSize],
  );

  const requiresSize = hasSizes;
  const canAdd =
    (!requiresSize || selectedSize !== undefined) && selectedStock > 0;
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
      <AddToCartButton
        product={product}
        size={selectedSize}
        stock={selectedStock}
        lineId={buildCartLineId(product.id, undefined, selectedSize)}
        disabled={!canAdd}
      />
      <ProductPurchasePolicies />
    </>
  );
}
