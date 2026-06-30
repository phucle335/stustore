import type { OrderStatus } from "@/lib/supabase/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "pending_payment",
  "deposit_paid",
  "payment_verified",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  pending_payment: "Awaiting Deposit",
  deposit_paid: "Deposit Paid",
  payment_verified: "Payment Verified",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "admin-status-chip admin-status-chip--amber",
  pending_payment: "admin-status-chip admin-status-chip--orange",
  deposit_paid: "admin-status-chip admin-status-chip--sky",
  payment_verified: "admin-status-chip admin-status-chip--emerald",
  confirmed: "admin-status-chip admin-status-chip--sky",
  processing: "admin-status-chip admin-status-chip--orange",
  shipped: "admin-status-chip admin-status-chip--orange",
  delivered: "admin-status-chip admin-status-chip--emerald",
  cancelled: "admin-status-chip admin-status-chip--red",
};

export function orderStatusChipClass(status: OrderStatus): string {
  return ORDER_STATUS_STYLES[status] ?? "admin-status-chip admin-status-chip--teal";
}
