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
  fulfillment_type: "in_stock" | "pre_order";
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
    fulfillment_type:
      item.fulfillmentType === "pre_order" ? "pre_order" : "in_stock",
  }));
}

export function preorderDepositAmount(totalVnd: number): number {
  return Math.round(totalVnd * 0.5);
}

export function paymentMethodLabel(method: CheckoutPaymentMethod): string {
  switch (method) {
    case "cod":
      return "Cash on Delivery (COD)";
    case "bank_transfer":
      return "Bank Transfer";
    case "preorder_deposit":
      return "50% Deposit — Bank Transfer (pre-order)";
    case "cod_deposit":
      return "COD — 100,000 VND deposit";
    case "bank_transfer_full":
      return "Full Bank Transfer";
    default:
      return method;
  }
}
