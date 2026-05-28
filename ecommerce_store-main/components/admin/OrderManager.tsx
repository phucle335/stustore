"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createOrderAction,
  deleteOrderAction,
  updateOrderAction,
} from "@/lib/admin/actions/orders";
import { OrderImportPanel } from "@/components/admin/OrderImportPanel";
import { formatCurrency } from "@/components/admin/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
} from "@/components/admin/order-status";
import type {
  AdminAuditLog,
  DbOrder,
  DbUser,
  OrderStatus,
} from "@/lib/supabase/types";

type OrderManagerProps = {
  initialOrders: DbOrder[];
  customers: DbUser[];
  products?: { id: string; name: string; price: number }[];
  auditLogs?: AdminAuditLog[];
};

type OrderFormState = {
  id: string | null;
  user_id: string;
  product_name: string;
  product_id: string;
  product_image: string;
  product_quantity: string;
  product_unit_price: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address: string;
  total_price: string;
  discount_amount: string;
  surcharge_amount: string;
  actual_collected_amount: string;
  payment_method: string;
  deposit_amount: string;
  remaining_amount: string;
  status: OrderStatus;
  handler_name: string;
  paid_at: string;
  source_page: string;
  source_post_id: string;
  referrer_id: string;
  warehouse_name: string;
  shipping_carrier: string;
  tracking_code: string;
  carrier_shipping_fee: string;
  shipping_locked: boolean;
  note: string;
};

const emptyOrderForm = (): OrderFormState => ({
  id: null,
  user_id: "",
  product_name: "",
  product_id: "",
  product_image: "",
  product_quantity: "1",
  product_unit_price: "0",
  shipping_full_name: "",
  shipping_phone: "",
  shipping_address: "",
  total_price: "",
  discount_amount: "0",
  surcharge_amount: "0",
  actual_collected_amount: "0",
  payment_method: "",
  deposit_amount: "",
  remaining_amount: "",
  status: "pending_payment",
  handler_name: "",
  paid_at: "",
  source_page: "",
  source_post_id: "",
  referrer_id: "",
  warehouse_name: "",
  shipping_carrier: "",
  tracking_code: "",
  carrier_shipping_fee: "0",
  shipping_locked: false,
  note: "",
});

function parseOrderMeta(order: DbOrder): Record<string, unknown> {
  return order.order_meta && typeof order.order_meta === "object"
    ? (order.order_meta as Record<string, unknown>)
    : {};
}

function orderToForm(order: DbOrder): OrderFormState {
  const firstItem = Array.isArray(order.order_items)
    ? (order.order_items[0] as Record<string, unknown> | undefined)
    : undefined;
  const meta = parseOrderMeta(order);

  return {
    id: order.id,
    user_id: order.user_id ?? "",
    product_name: String(firstItem?.name ?? ""),
    product_id: String(firstItem?.product_id ?? ""),
    product_image: String(firstItem?.image ?? ""),
    product_quantity: String(Number(firstItem?.quantity ?? 1) || 1),
    product_unit_price: String(Number(firstItem?.unit_price ?? 0) || 0),
    shipping_full_name: String(order.shipping_full_name ?? ""),
    shipping_phone: String(order.shipping_phone ?? ""),
    shipping_address: String(order.shipping_address ?? ""),
    total_price: String(order.total_price),
    discount_amount: String(Number(order.discount_amount ?? 0) || 0),
    surcharge_amount: String(Number(meta.surcharge_amount ?? 0) || 0),
    actual_collected_amount: String(
      Number(meta.actual_collected_amount ?? order.total_price ?? 0) || 0,
    ),
    payment_method: String(order.payment_method ?? ""),
    deposit_amount: String(order.deposit_amount ?? ""),
    remaining_amount: String(order.remaining_amount ?? ""),
    status: order.status,
    handler_name: String(meta.handler_name ?? ""),
    paid_at: String(meta.paid_at ?? ""),
    source_page: String(meta.source_page ?? ""),
    source_post_id: String(meta.source_post_id ?? ""),
    referrer_id: String(meta.referrer_id ?? ""),
    warehouse_name: String(meta.warehouse_name ?? ""),
    shipping_carrier: String(meta.shipping_carrier ?? ""),
    tracking_code: String(meta.tracking_code ?? ""),
    carrier_shipping_fee: String(Number(meta.carrier_shipping_fee ?? 0) || 0),
    shipping_locked: Boolean(meta.shipping_locked),
    note: String(meta.note ?? ""),
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderManager({
  initialOrders,
  customers,
  products = [],
  auditLogs = [],
}: OrderManagerProps) {
  const ORDER_PAGE_SIZE = 10;
  const [orders, setOrders] = useState(initialOrders);
  const [form, setForm] = useState<OrderFormState>(emptyOrderForm);
  const [screen, setScreen] = useState<"list" | "detail">("list");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const emailByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const customer of customers) {
      map.set(customer.id, customer.email);
    }
    return map;
  }, [customers]);

  const orderHistory = useMemo(() => {
    if (!form.id) return [];
    return auditLogs
      .filter(
        (log) =>
          log.entity_type === "order" && String(log.entity_id ?? "") === form.id,
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [auditLogs, form.id]);

  const filteredOrders = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (statusFilter !== "all" && order.status !== statusFilter) return false;
        if (!q) return true;
        const customerEmail = order.user_id
          ? emailByUserId.get(order.user_id) ?? ""
          : "";
        const haystack = [
          order.id,
          customerEmail,
          order.shipping_full_name ?? "",
          order.shipping_phone ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [orders, statusFilter, keyword, emailByUserId]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));
  const pagedFilteredOrders = useMemo(
    () =>
      filteredOrders.slice(
        (page - 1) * ORDER_PAGE_SIZE,
        page * ORDER_PAGE_SIZE,
      ),
    [filteredOrders, page],
  );

  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function statusChipClass(status: OrderStatus) {
    if (status === "pending" || status === "pending_payment") {
      return "bg-amber-500/20 text-amber-300";
    }
    if (status === "delivered") {
      return "bg-emerald-500/20 text-emerald-300";
    }
    if (status === "cancelled") {
      return "bg-red-500/20 text-red-300";
    }
    if (status === "payment_verified") {
      return "bg-emerald-500/20 text-emerald-300";
    }
    if (status === "deposit_paid") {
      return "bg-sky-500/20 text-sky-300";
    }
    if (status === "confirmed" || status === "processing" || status === "shipped") {
      return "bg-orange-500/20 text-orange-300";
    }
    return "bg-teal-500/20 text-teal-300";
  }

  function paidDepositForStatus(status: OrderStatus, depositAmount: number) {
    if (status === "deposit_paid") return depositAmount;
    if (
      status === "payment_verified" ||
      status === "confirmed" ||
      status === "processing" ||
      status === "shipped" ||
      status === "delivered"
    ) {
      return depositAmount;
    }
    return 0;
  }

  function paymentStatusText(order: DbOrder) {
    if (["deposit_paid", "payment_verified", "delivered"].includes(order.status)) {
      return "Đã thanh toán";
    }
    return "Chưa thanh toán";
  }

  function productLines(order: DbOrder): string[] {
    if (!Array.isArray(order.order_items)) return ["-"];
    return order.order_items
      .map((it) => {
        const row = it as Record<string, unknown>;
        const qty = Number(row.quantity ?? 1) || 1;
        const name = String(row.name ?? "").trim();
        const pid = String(row.product_id ?? "").trim();
        return name ? `${qty} x ${name}${pid ? ` (#${pid})` : ""}` : "";
      })
      .filter(Boolean);
  }

  function productItems(order: DbOrder): { label: string; image: string | null }[] {
    if (!Array.isArray(order.order_items)) return [];
    return order.order_items
      .map((it) => {
        const row = it as Record<string, unknown>;
        const qty = Number(row.quantity ?? 1) || 1;
        const name = String(row.name ?? "").trim();
        const pid = String(row.product_id ?? "").trim();
        const image = String(row.image ?? "").trim();
        const label = name ? `${qty} x ${name}${pid ? ` (#${pid})` : ""}` : "";
        return { label, image: image || null };
      })
      .filter((x) => Boolean(x.label));
  }

  function applyProductById(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setForm((c) => ({
      ...c,
      product_id: id,
      product_name: product.name,
      product_unit_price: String(product.price),
    }));
  }

  function selectOrder(order: DbOrder) {
    setForm(orderToForm(order));
    setMessage(null);
    setError(null);
    setScreen("detail");
  }

  function resetForm() {
    setForm(emptyOrderForm());
    setMessage(null);
    setError(null);
    setScreen("detail");
  }

  function handleSave() {
    const total_price = Number(form.total_price);
    const discount_amount = Number(form.discount_amount || 0);
    const surcharge_amount = Number(form.surcharge_amount || 0);
    const actual_collected_amount = Number(form.actual_collected_amount || 0);
    const deposit_amount = Number(form.deposit_amount || 0);
    const remaining_amount = Number(form.remaining_amount || 0);
    const carrier_shipping_fee = Number(form.carrier_shipping_fee || 0);
    const product_quantity = Math.max(1, Number(form.product_quantity) || 1);
    const product_unit_price = Math.max(0, Number(form.product_unit_price) || 0);

    if (Number.isNaN(total_price) || total_price < 0) {
      setError("Giá trị đơn hàng không hợp lệ.");
      return;
    }

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const payload = {
        user_id: form.user_id.trim() || null,
        total_price,
        discount_amount,
        payment_method: form.payment_method.trim() || null,
        deposit_amount,
        remaining_amount,
        shipping_full_name: form.shipping_full_name.trim() || null,
        shipping_phone: form.shipping_phone.trim() || null,
        shipping_address: form.shipping_address.trim() || null,
        order_items: [
          {
            name: form.product_name.trim(),
            product_id: form.product_id.trim(),
            quantity: product_quantity,
            unit_price: product_unit_price,
          },
        ],
        order_meta: {
          surcharge_amount,
          actual_collected_amount,
          handler_name: form.handler_name.trim(),
          paid_at: form.paid_at,
          source_page: form.source_page.trim(),
          source_post_id: form.source_post_id.trim(),
          referrer_id: form.referrer_id.trim(),
          warehouse_name: form.warehouse_name.trim(),
          shipping_carrier: form.shipping_carrier.trim(),
          tracking_code: form.tracking_code.trim(),
          carrier_shipping_fee,
          shipping_locked: form.shipping_locked,
          note: form.note,
        },
        status: form.status,
      };

      const result = form.id
        ? await updateOrderAction(form.id, payload)
        : await createOrderAction(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOrders((current) => {
        if (form.id) {
          return current.map((item) =>
            item.id === result.data.id ? result.data : item,
          );
        }
        return [result.data, ...current];
      });
      setForm(orderToForm(result.data));
      setMessage(form.id ? "Đã cập nhật đơn hàng." : "Đã tạo đơn hàng mới.");
    });
  }

  function lockShippingAndCreateWaybill() {
    setForm((current) => ({ ...current, shipping_locked: true }));
    setMessage("Đã tạo vận đơn giả lập. Thông tin giao hàng đã bị khóa.");
    setError(null);
  }

  function handleDelete() {
    if (!form.id) return;
    if (!window.confirm("Xóa đơn hàng này?")) return;

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = await deleteOrderAction(form.id!);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOrders((current) => current.filter((item) => item.id !== form.id));
      resetForm();
      setMessage("Đã xóa đơn hàng.");
    });
  }

  return (
    <section className="admin-panel">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold admin-text">Đơn hàng</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className={`admin-btn ${screen === "list" ? "admin-btn--primary" : ""}`}
            onClick={() => setScreen("list")}
          >
            Danh sách
          </button>
          <button
            type="button"
            className={`admin-btn ${screen === "detail" ? "admin-btn--primary" : ""}`}
            onClick={() => setScreen("detail")}
          >
            Chi tiết
          </button>
        </div>
      </div>

      {screen === "list" ? (
        <div className="space-y-4">
          <div className="admin-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="admin-input max-md:w-full"
                  style={{ width: 130 }}
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as OrderStatus | "all")
                  }
                >
                  <option value="all">Tất cả</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <input
                  className="admin-input max-md:w-full"
                  style={{ width: 260 }}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm"
                />
                <button type="button" className="admin-btn">
                  Lọc
                </button>
                <button type="button" className="admin-btn">
                  Tìm
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="admin-btn">
                  Export
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={resetForm}
                >
                  + Tạo đơn
                </button>
              </div>
            </div>
          </div>

          <div className="admin-table-wrap hidden md:block">
            <table className="admin-table admin-order-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" />
                  </th>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Tổng tiền (VND)</th>
                  <th>Page</th>
                  <th>Ghi chú</th>
                  <th>Trạng thái thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {pagedFilteredOrders.map((order) => {
                  const meta = parseOrderMeta(order);
                  const page = String(meta.source_page ?? "My Love Story");
                  const note = String(meta.note ?? "");
                  return (
                    <tr
                      key={order.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => selectOrder(order)}
                    >
                      <td>
                        <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                      </td>
                      <td>
                        <span style={{ color: "#60a5fa", fontWeight: 600 }}>
                          {order.id}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              background: "rgba(255,255,255,.1)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                            }}
                          >
                            KH
                          </span>
                          <div>
                            <div className="admin-text">
                              {order.shipping_full_name || "Khách lẻ"}
                            </div>
                            <div className="admin-muted text-xs">
                              {order.shipping_phone || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {productItems(order).slice(0, 3).map((it, idx) => (
                          <div
                            key={idx}
                            className="admin-muted text-xs"
                            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
                          >
                            <span className="admin-order-thumb">
                              {it.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.image} alt="" className="admin-order-thumb__img" />
                              ) : null}
                            </span>
                            <span>{it.label}</span>
                          </div>
                        ))}
                      </td>
                      <td>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{}}
                        >
                          <span className={statusChipClass(order.status)}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </span>
                      </td>
                      <td className="admin-muted text-xs">
                        <div>{new Date(order.created_at).toLocaleDateString("vi-VN")}</div>
                        <div>
                          {new Date(order.created_at).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td>{formatCurrency(order.total_price)}</td>
                      <td>
                        <span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                          {page}
                        </span>
                      </td>
                      <td className="admin-muted text-xs">{note || "-"}</td>
                      <td className="admin-muted text-xs">{paymentStatusText(order)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pagedFilteredOrders.map((order) => {
              const meta = parseOrderMeta(order);
              const page = String(meta.source_page ?? "My Love Story");
              const note = String(meta.note ?? "");
              return (
                <button
                  key={order.id}
                  type="button"
                  className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-left"
                  onClick={() => selectOrder(order)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: "#60a5fa" }}>
                      {order.id}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusChipClass(order.status)}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm admin-text">
                    {order.shipping_full_name || "Khách lẻ"} · {order.shipping_phone || "—"}
                  </p>
                  <div className="mt-2 space-y-1 text-xs admin-muted">
                    {productLines(order).slice(0, 2).map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                    <p>
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}{" "}
                      {new Date(order.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p>Tổng: <span className="admin-text">{formatCurrency(order.total_price)}</span></p>
                    <p>Page: <span className="text-blue-300">{page}</span></p>
                    <p>Thanh toán: {paymentStatusText(order)}</p>
                    {note ? <p>Ghi chú: {note}</p> : null}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs admin-muted">
              Trang {page}/{totalPages} - {filteredOrders.length} đơn
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="admin-btn"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Trang trước
              </button>
              <button
                type="button"
                className="admin-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Trang sau
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="admin-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="admin-text font-semibold">
                    Đơn hàng: #{form.id || "Mới"}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusChipClass(form.status)}`}
                  >
                    {ORDER_STATUS_LABELS[form.status]}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                    {form.status === "payment_verified" || form.status === "deposit_paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </span>
                </div>
                <p className="admin-muted text-xs mt-1">
                  Chỉnh sửa: {new Date().toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setMessage("Đã gửi biên lai cho khách.")}
                >
                  Gửi biên lai
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
                  onClick={() => window.print()}
                >
                  In đơn
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  {isPending ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--admin-border)] p-4">
                <h3 className="mb-3 text-sm font-semibold admin-text">
                  THÔNG TIN SẢN PHẨM
                </h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Giá bán</th>
                        <th>Giảm</th>
                        <th>Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span className="admin-order-thumb">
                            {form.product_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={form.product_image}
                                alt={form.product_name || ""}
                                className="admin-order-thumb__img"
                              />
                            ) : null}
                          </span>
                        </td>
                        <td>
                          <input
                            placeholder="Product ID"
                            value={form.product_id}
                            onChange={(e) =>
                              setForm((c) => ({ ...c, product_id: e.target.value }))
                            }
                            onBlur={(e) => applyProductById(e.target.value.trim())}
                            className="admin-input mb-1"
                          />
                          <input
                            value={form.product_name}
                            onChange={(e) =>
                              setForm((c) => ({ ...c, product_name: e.target.value }))
                            }
                            className="admin-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            value={form.product_quantity}
                            onChange={(e) =>
                              setForm((c) => ({ ...c, product_quantity: e.target.value }))
                            }
                            className="admin-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={form.product_unit_price}
                            onChange={(e) =>
                              setForm((c) => ({ ...c, product_unit_price: e.target.value }))
                            }
                            className="admin-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={form.discount_amount}
                            onChange={(e) =>
                              setForm((c) => ({ ...c, discount_amount: e.target.value }))
                            }
                            className="admin-input"
                          />
                        </td>
                        <td className="admin-text">
                          {formatCurrency(Number(form.total_price || 0))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--admin-border)] p-4">
                <h3 className="mb-3 text-sm font-semibold admin-text">
                  THÔNG TIN THANH TOÁN
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-sm admin-text">
                      Link thanh toán
                      <input
                        className="admin-input mt-1.5"
                        value={form.source_page}
                        onChange={(e) =>
                          setForm((c) => ({ ...c, source_page: e.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </label>
                    <label className="block text-sm admin-text">
                      Ghi chú
                      <textarea
                        className="admin-input mt-1.5"
                        rows={3}
                        value={form.note}
                        onChange={(e) => setForm((c) => ({ ...c, note: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="admin-muted">Tổng tiền</span>
                      <strong className="admin-text">
                        {formatCurrency(Number(form.total_price || 0))}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="admin-muted">Phụ thu</span>
                      <span className="admin-text">
                        {formatCurrency(Number(form.surcharge_amount || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="admin-muted">Giảm giá</span>
                      <span className="admin-text">
                        {formatCurrency(Number(form.discount_amount || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="admin-muted">Thu khách hàng</span>
                      <strong className="admin-text">
                        {formatCurrency(Number(form.actual_collected_amount || 0))}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="admin-muted">Phương thức thanh toán</span>
                      <span className="admin-text">
                        {form.payment_method || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="admin-muted">Đã cọc</span>
                      <span className="admin-text">
                        {formatCurrency(
                          paidDepositForStatus(
                            form.status,
                            Number(form.deposit_amount || 0),
                          ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="admin-muted">Còn lại</span>
                      <span className="admin-text">
                        {formatCurrency(Number(form.remaining_amount || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--admin-border)] p-4">
                <h3 className="mb-3 text-sm font-semibold admin-text">NGƯỜI GIAO</h3>
                <p className="admin-muted text-sm">Chưa có thông tin giao hàng</p>
                <div className="mt-3">
                  <button
                    type="button"
                    disabled={form.shipping_locked}
                    onClick={lockShippingAndCreateWaybill}
                    className="admin-btn"
                  >
                    Người giao
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" className="admin-btn admin-btn--primary">
                    Lịch sử vận đơn
                  </button>
                  <button type="button" className="admin-btn">
                    Lịch sử đặt hàng
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--admin-border)] p-4">
                <h3 className="mb-3 text-sm font-semibold admin-text">
                  Lịch sử cập nhật đơn hàng
                </h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Người cập nhật</th>
                        <th>Hành động</th>
                        <th>Thay đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center admin-muted">
                            Chưa có lịch sử cập nhật
                          </td>
                        </tr>
                      ) : (
                        orderHistory.map((log) => (
                          <tr key={log.id}>
                            <td className="admin-muted">{formatDate(log.created_at)}</td>
                            <td className="admin-text">
                              {log.admin_user_id
                                ? (emailByUserId.get(log.admin_user_id) ??
                                  log.admin_user_id.slice(0, 8))
                                : "Hệ thống"}
                            </td>
                            <td className="admin-text">{log.action}</td>
                            <td className="admin-muted">
                              {JSON.stringify(log.diff ?? {}).slice(0, 120)}
                              {JSON.stringify(log.diff ?? {}).length > 120 ? "…" : ""}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--admin-border)] p-4">
                <h3 className="mb-3 text-sm font-semibold admin-text">
                  THÔNG TIN KHÁCH HÀNG
                </h3>
                <p className="admin-text">{form.shipping_full_name || "—"}</p>
                <p className="text-sm">
                  <a
                    href={form.shipping_phone ? `tel:${form.shipping_phone}` : "#"}
                    style={{ color: "#60a5fa", textDecoration: "none" }}
                  >
                    {form.shipping_phone || "—"}
                  </a>
                </p>
                <p className="admin-muted text-sm mt-2">{form.shipping_address || "—"}</p>
              </div>

              <div className="rounded-xl border border-[var(--admin-border)] p-4">
                <h3 className="mb-3 text-sm font-semibold admin-text">
                  THÔNG TIN BỔ SUNG
                </h3>
                <div className="space-y-3">
                  <label className="block text-sm admin-text">
                    Trạng thái
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, status: e.target.value as OrderStatus }))
                      }
                      className="admin-input mt-1.5"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm admin-text">
                    Người xử lý
                    <input
                      className="admin-input mt-1.5"
                      value={form.handler_name}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, handler_name: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm admin-text">
                    Ngày thanh toán
                    <input
                      type="date"
                      className="admin-input mt-1.5"
                      value={form.paid_at}
                      onChange={(e) => setForm((c) => ({ ...c, paid_at: e.target.value }))}
                    />
                  </label>
                  <label className="block text-sm admin-text">
                    Page
                    <input
                      className="admin-input mt-1.5"
                      value={form.source_page}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, source_page: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm admin-text">
                    PostID
                    <input
                      className="admin-input mt-1.5"
                      value={form.source_post_id}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, source_post_id: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm admin-text">
                    AfID
                    <input
                      className="admin-input mt-1.5"
                      value={form.referrer_id}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, referrer_id: e.target.value }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-400">
              {message}
            </p>
          ) : null}
        </div>
      )}

      <OrderImportPanel
        customers={customers}
        onImported={(imported) => {
          setOrders((current) => [...imported, ...current]);
          setMessage(`Đã thêm ${imported.length} đơn từ file.`);
          setError(null);
        }}
      />
      {screen === "detail" && form.id ? (
        <div className="mt-3">
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
          >
            Xóa đơn
          </button>
        </div>
      ) : null}
    </section>
  );
}
