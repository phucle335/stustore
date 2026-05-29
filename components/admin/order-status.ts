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
  pending: "Chờ xử lý",
  pending_payment: "Chờ thanh toán cọc",
  deposit_paid: "Đã trả cọc",
  payment_verified: "Đã xác minh thanh toán",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đã gửi",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
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
