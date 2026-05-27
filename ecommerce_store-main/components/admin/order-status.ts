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
  pending: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  pending_payment: "bg-orange-500/15 text-orange-400 ring-orange-500/30",
  deposit_paid: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/30",
  payment_verified: "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  confirmed: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  processing: "bg-violet-500/15 text-violet-400 ring-violet-500/30",
  shipped: "bg-indigo-500/15 text-indigo-400 ring-indigo-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 ring-red-500/30",
};
