import type { Product } from "./types";

export function resolveSizeStock(
  productIndex: number,
  sizeIndex: number,
): number {
  const variant = productIndex + sizeIndex + 1;

  if (variant % 17 === 0) {
    return 0;
  }

  if (variant % 11 === 0) {
    return 2;
  }

  return 4 + ((productIndex + sizeIndex * 3) % 12) + (sizeIndex % 4);
}

export function resolveProductStock(productIndex: number): number {
  const number = productIndex + 1;

  if (number % 17 === 0) {
    return 0;
  }

  if (number % 11 === 0) {
    return 2;
  }

  return 8 + (productIndex % 15) + (productIndex % 7);
}

export function buildSizeStock(
  sizes: string[],
  productIndex: number,
): Record<string, number> {
  return Object.fromEntries(
    sizes.map((size, sizeIndex) => [
      size,
      resolveSizeStock(productIndex, sizeIndex),
    ]),
  );
}

export function getStockForProduct(
  product: Product | undefined,
  size?: string,
): number {
  if (!product) {
    return 0;
  }

  if (size !== undefined && product.sizeStock !== undefined) {
    return product.sizeStock[size] ?? 0;
  }

  return product.stock;
}

export function formatStockLabel(stock: number, size?: string): string {
  if (stock <= 0) {
    return size ? `Size ${size} — hết hàng` : "Hết hàng";
  }

  if (stock <= 5) {
    return size
      ? `Size ${size} — sắp hết, còn ${stock}`
      : `Sắp hết hàng — còn ${stock} sản phẩm`;
  }

  return size
    ? `Size ${size} — còn ${stock} sản phẩm`
    : `Còn ${stock} sản phẩm trong kho`;
}
