export type CartItem = {
  lineId: string;
  productId: string;
  color?: string;
  size?: string;
  name: string;
  brand: string;
  image: string;
  imageAlt: string;
  price: string;
  oldPrice?: string;
  quantity: number;
};

export type AddToCartInput = Omit<CartItem, "quantity">;

export function buildCartLineId(
  productId: string,
  color?: string,
  size?: string,
): string {
  return `${productId}::${color ?? ""}::${size ?? ""}`;
}

const CART_STORAGE_KEY = "stusport-cart";

export function parsePriceVnd(price: string): number {
  const digits = price.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatPriceVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function getCartTotalVnd(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + parsePriceVnd(item.price) * item.quantity,
    0,
  );
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is CartItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as CartItem).productId === "string" &&
          typeof (item as CartItem).quantity === "number",
      )
      .map((item) => {
        if (typeof item.lineId === "string" && item.lineId.length > 0) {
          return item;
        }

        const color =
          typeof item.color === "string" && item.color.length > 0
            ? item.color
            : undefined;
        const size =
          typeof item.size === "string" && item.size.length > 0
            ? item.size
            : undefined;

        return {
          ...item,
          ...(color !== undefined ? { color } : {}),
          ...(size !== undefined ? { size } : {}),
          lineId: buildCartLineId(item.productId, color, size),
        };
      });
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
