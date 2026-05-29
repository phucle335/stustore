"use client";

import { useEffect, useMemo, useState } from "react";
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
  filterQuery?: string;
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
    .map((it) => String((it as { name?: string })?.name ?? "").trim())
    .filter(Boolean);
  return names.length > 0 ? names.slice(0, 2).join(", ") : "—";
}

function extractProductThumbs(order: DbOrder): string[] {
  const items = safeParseOrderItems(order.order_items);
  return items
    .map((it) => String((it as { image?: string })?.image ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);
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
  filterQuery = "",
}: OrdersTablePreviewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const emailByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.email);
    return map;
  }, [users]);

  useEffect(() => {
    if (filterQuery.trim()) {
      setQuery(filterQuery);
    }
  }, [filterQuery]);

  const filtered = useMemo(() => {
    const q = (filterQuery.trim() || query.trim()).toLowerCase();
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
  }, [orders, status, query, filterQuery, emailByUserId]);

  return (
    <section className="admin-card">
      <div className="admin-flex-between" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="admin-card-title">Đơn hàng</h2>
          <p className="admin-card-sub">Bảng tóm tắt trạng thái mới nhất</p>
        </div>
        <div className="admin-filter-row">
          <input
            className="admin-input"
            placeholder="Tìm theo mã / khách hàng"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="admin-input"
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

      <div className="admin-table-wrap admin-only-desktop">
        <table className="admin-table admin-order-table">
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
                const email = order.user_id ? emailByUserId.get(order.user_id) : null;
                const fallbackUserId = order.user_id ? order.user_id.slice(0, 8) : null;
                const customerName =
                  String(order.shipping_full_name ?? "").trim() || "Khách lẻ";
                const customerPhone =
                  String(order.shipping_phone ?? "").trim() || "";
                return (
                  <tr key={order.id}>
                    <td className="font-medium admin-text">{order.id}</td>
                    <td className="admin-text">
                      <div>
                        <span style={{ fontWeight: 600 }}>{customerName}</span>
                        <div className="admin-muted" style={{ fontSize: 12, marginTop: 4 }}>
                          {email
                            ? email
                            : fallbackUserId
                              ? `User: ${fallbackUserId}`
                              : customerPhone
                                ? customerPhone
                                : "—"}
                          {email && customerPhone ? ` · ${customerPhone}` : ""}
                        </div>
                      </div>
                    </td>
                    <td className="admin-text">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {extractProductThumbs(order).map((src, idx) => (
                            <span key={idx} className="admin-order-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" className="admin-order-thumb__img" />
                            </span>
                          ))}
                        </div>
                        <span style={{ wordBreak: "break-word" }}>{extractProductLabel(order)}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={ORDER_STATUS_STYLES[order.status]}
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

      <div className="admin-order-mobile-list admin-only-mobile">
        {filtered.length === 0 ? (
          <p className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
            Không có kết quả
          </p>
        ) : (
          filtered.map((order) => {
            const email = order.user_id ? emailByUserId.get(order.user_id) : null;
            const customerName =
              String(order.shipping_full_name ?? "").trim() || "Khách lẻ";
            const customerPhone = String(order.shipping_phone ?? "").trim();
            return (
              <article key={order.id} className="admin-mobile-card" style={{ cursor: "default" }}>
                <div className="admin-mobile-card__head">
                  <p className="admin-mobile-card__id">{order.id}</p>
                  <span className={ORDER_STATUS_STYLES[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="admin-mobile-card__body">
                  <p className="admin-text" style={{ fontWeight: 600 }}>
                    {customerName}
                  </p>
                  <p>
                    {email ?? "—"}
                    {customerPhone ? ` · ${customerPhone}` : ""}
                  </p>
                  <div className="admin-mobile-card__products">
                    {extractProductThumbs(order).map((src, idx) => (
                      <span key={idx} className="admin-order-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="admin-order-thumb__img" />
                      </span>
                    ))}
                    <span className="admin-mobile-card__product-label">
                      {extractProductLabel(order)}
                    </span>
                  </div>
                  <p>
                    {formatDate(order.created_at)} ·{" "}
                    <strong className="admin-text">
                      {formatCurrency(order.total_price ?? 0)}
                    </strong>
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
