"use client";

import { useMemo, useState } from "react";
import type { DbOrder, DbUser, OrderStatus } from "@/lib/supabase/types";
import { formatCurrency } from "@/components/admin/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/components/admin/order-status";

type OrdersTablePreviewProps = {
  orders: DbOrder[];
  users: DbUser[];
};

function safeParseOrderItems(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function extractProductLabel(order: DbOrder): string {
  const items = safeParseOrderItems(order.order_items);
  const names = items
    .map((it: any) => String(it?.name ?? "").trim())
    .filter(Boolean);
  return names.length > 0 ? names.slice(0, 2).join(", ") : "—";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function OrdersTablePreview({
  orders,
  users,
}: OrdersTablePreviewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const emailByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.email);
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .filter((o) => {
        if (status !== "all" && o.status !== status) return false;
        if (!q) return true;
        const email = o.user_id ? emailByUserId.get(o.user_id) : null;
        const haystack = [
          o.id,
          email ?? "",
          o.shipping_full_name ?? "",
          String(o.payment_method ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 12);
  }, [orders, status, query, emailByUserId]);

  return (
    <section className="admin-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-card-title">Đơn hàng</h2>
          <p className="admin-card-sub">Bảng tóm tắt trạng thái mới nhất</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="admin-input"
            style={{ width: 220 }}
            placeholder="Tìm theo mã / khách hàng"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="admin-input"
            style={{ width: 180 }}
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
          >
            <option value="all">Tất cả trạng thái</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th style={{ textAlign: "right" }}>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
                  Không có kết quả
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const email = order.user_id
                  ? emailByUserId.get(order.user_id) ?? order.user_id.slice(0, 8)
                  : "Khách lẻ";
                return (
                  <tr key={order.id}>
                    <td className="font-medium admin-text">{order.id}</td>
                    <td className="admin-text">{email}</td>
                    <td className="admin-text">{extractProductLabel(order)}</td>
                    <td>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${ORDER_STATUS_STYLES[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="admin-muted">{formatDate(order.created_at)}</td>
                    <td style={{ textAlign: "right" }} className="font-medium admin-text">
                      {formatCurrency(order.total_price ?? 0)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

