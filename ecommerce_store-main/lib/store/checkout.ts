import type { CartItem } from "@/lib/store/cart";

export type CheckoutPaymentMethod =
  | "cod"
  | "bank_transfer"
  | "preorder_deposit"
  | "cod_deposit"
  | "bank_transfer_full";

export type CheckoutOrderItem = {
  product_id: string;
  name: string;
  brand: string;
  size?: string;
  quantity: number;
  unit_price: number;
  image: string;
};

export function cartItemsToOrderItems(items: CartItem[]): CheckoutOrderItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    name: item.name,
    brand: item.brand,
    ...(item.size ? { size: item.size } : {}),
    quantity: item.quantity,
    unit_price: Number(item.price.replace(/\D/g, "")) || 0,
    image: item.image,
  }));
}

export function preorderDepositAmount(totalVnd: number): number {
  return Math.round(totalVnd * 0.5);
}

export function paymentMethodLabel(method: CheckoutPaymentMethod): string {
  switch (method) {
    case "cod":
      return "Thanh toán khi nhận hàng (COD)";
    case "bank_transfer":
      return "Chuyển khoản ngân hàng";
    case "preorder_deposit":
      return "Cọc 50% — Chuyển khoản (pre-order)";
    case "cod_deposit":
      return "COD cọc 100.000đ";
    case "bank_transfer_full":
      return "Chuyển khoản toàn bộ";
    default:
      return method;
  }
}
