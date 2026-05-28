"use client";

import { useMemo, useState, useTransition } from "react";
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
  ORDER_STATUS_STYLES,
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
  auditLogs?: AdminAuditLog[];
};

type OrderFormState = {
  id: string | null;
  user_id: string;
  product_name: string;
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
};

const emptyOrderForm = (): OrderFormState => ({
  id: null,
  user_id: "",
  product_name: "",
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
});

function orderToForm(order: DbOrder): OrderFormState {
  const firstItem = Array.isArray(order.order_items)
    ? (order.order_items[0] as Record<string, unknown> | undefined)
    : undefined;
  const meta =
    order.order_meta && typeof order.order_meta === "object"
      ? (order.order_meta as Record<string, unknown>)
      : {};

  return {
    id: order.id,
    user_id: order.user_id ?? "",
    product_name: String(firstItem?.name ?? ""),
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
  auditLogs = [],
}: OrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [form, setForm] = useState<OrderFormState>(emptyOrderForm);
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

  function selectOrder(order: DbOrder) {
    setForm(orderToForm(order));
    setMessage(null);
    setError(null);
  }

  function resetForm() {
    setForm(emptyOrderForm());
    setMessage(null);
    setError(null);
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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold admin-text">Quản lý đơn hàng</h2>
          <p className="text-sm admin-muted">
            Chỉnh sửa thông tin đơn, tạo vận đơn, in đơn và theo dõi lịch sử cập
            nhật.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="admin-btn admin-btn--primary"
        >
          + Đơn mới
        </button>
      </div>

      <OrderImportPanel
        customers={customers}
        onImported={(imported) => {
          setOrders((current) => [...imported, ...current]);
          setMessage(`Đã thêm ${imported.length} đơn từ file.`);
          setError(null);
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="admin-list-aside space-y-2" style={{ maxHeight: "480px" }}>
          {orders.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm admin-muted">
              Chưa có đơn hàng
            </p>
          ) : (
            orders.map((order) => {
              const active = form.id === order.id;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => selectOrder(order)}
                  className={`admin-list-item${active ? " is-active" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {formatCurrency(order.total_price)}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${ORDER_STATUS_STYLES[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs admin-muted">
                    {order.user_id
                      ? (emailByUserId.get(order.user_id) ?? order.user_id.slice(0, 8))
                      : "Khách lẻ"}{" "}
                    · {formatDate(order.created_at)}
                  </p>
                </button>
              );
            })
          )}
        </aside>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--admin-border)] p-4">
            <h3 className="mb-3 text-sm font-semibold admin-text">
              (1) Thông tin sản phẩm
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm admin-text">
                Tên sản phẩm
                <input
                  value={form.product_name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      product_name: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Số lượng
                <input
                  type="number"
                  min={1}
                  value={form.product_quantity}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      product_quantity: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Giá tiền
                <input
                  type="number"
                  min={0}
                  value={form.product_unit_price}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      product_unit_price: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--admin-border)] p-4">
            <h3 className="mb-3 text-sm font-semibold admin-text">
              (2) Thông tin khách hàng
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm admin-text">
                Khách hàng
                <select
                  value={form.user_id}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, user_id: e.target.value }))
                  }
                  className="admin-input mt-1.5"
                >
                  <option value="">Khách lẻ / không gán</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm admin-text">
                Tên
                <input
                  value={form.shipping_full_name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      shipping_full_name: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Số điện thoại
                <input
                  value={form.shipping_phone}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      shipping_phone: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text sm:col-span-2">
                Địa chỉ
                <input
                  value={form.shipping_address}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      shipping_address: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--admin-border)] p-4">
            <h3 className="mb-3 text-sm font-semibold admin-text">
              (3) Thông tin thanh toán
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm admin-text">
                Tổng đơn hàng
                <input
                  type="number"
                  min={0}
                  value={form.total_price}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      total_price: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Số tiền giảm giá
                <input
                  type="number"
                  min={0}
                  value={form.discount_amount}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      discount_amount: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Phụ thu
                <input
                  type="number"
                  min={0}
                  value={form.surcharge_amount}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      surcharge_amount: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Thực tế thu khách
                <input
                  type="number"
                  min={0}
                  value={form.actual_collected_amount}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      actual_collected_amount: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text sm:col-span-2">
                Phương thức thanh toán
                <input
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      payment_method: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--admin-border)] p-4">
            <h3 className="mb-3 text-sm font-semibold admin-text">
              (4) Thông tin bổ sung
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm admin-text sm:col-span-2">
                Trạng thái đơn hàng ở hệ thống
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      status: e.target.value as OrderStatus,
                    }))
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
                  value={form.handler_name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      handler_name: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Ngày thanh toán
                <input
                  type="date"
                  value={form.paid_at}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, paid_at: e.target.value }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Nguồn đơn (Fanpage)
                <input
                  value={form.source_page}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      source_page: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                ID bài viết
                <input
                  value={form.source_post_id}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      source_post_id: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text sm:col-span-2">
                ID người giới thiệu
                <input
                  value={form.referrer_id}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      referrer_id: e.target.value,
                    }))
                  }
                  className="admin-input mt-1.5"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--admin-border)] p-4">
            <h3 className="mb-3 text-sm font-semibold admin-text">
              (5) Giao hàng
            </h3>
            <p className="mb-3 text-xs admin-muted">
              Chỉ chỉnh trước khi bấm Tạo vận đơn. Sau đó dữ liệu giao hàng sẽ khóa.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm admin-text">
                Kho lấy hàng
                <input
                  value={form.warehouse_name}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      warehouse_name: e.target.value,
                    }))
                  }
                  disabled={form.shipping_locked}
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Đơn vị vận chuyển
                <input
                  value={form.shipping_carrier}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      shipping_carrier: e.target.value,
                    }))
                  }
                  disabled={form.shipping_locked}
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Mã vận đơn
                <input
                  value={form.tracking_code}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      tracking_code: e.target.value,
                    }))
                  }
                  disabled={form.shipping_locked}
                  className="admin-input mt-1.5"
                />
              </label>
              <label className="block text-sm admin-text">
                Phí ship
                <input
                  type="number"
                  min={0}
                  value={form.carrier_shipping_fee}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      carrier_shipping_fee: e.target.value,
                    }))
                  }
                  disabled={form.shipping_locked}
                  className="admin-input mt-1.5"
                />
              </label>
            </div>
          </div>

          {form.id ? (
            <p className="text-xs admin-muted">
              Mã đơn: <span className="font-mono text-[#94a3b8]">{form.id}</span>
            </p>
          ) : null}

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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
            >
              {isPending ? "Đang lưu…" : form.id ? "Lưu chỉnh sửa" : "Tạo đơn"}
            </button>
            <button
              type="button"
              disabled={!form.id || form.shipping_locked}
              onClick={lockShippingAndCreateWaybill}
              className="rounded-lg border border-amber-500/40 px-5 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-60"
            >
              Tạo vận đơn
            </button>
            <button
              type="button"
              disabled={!form.id}
              onClick={() => window.print()}
              className="rounded-lg border border-[var(--admin-border)] px-5 py-2.5 text-sm font-medium admin-text transition hover:bg-white/5 disabled:opacity-60"
            >
              In đơn
            </button>
            <button
              type="button"
              disabled={!form.id}
              onClick={() => setMessage("Đã gửi biên lai cho khách (giả lập).")}
              className="rounded-lg border border-emerald-500/40 px-5 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-60"
            >
              Gửi biên lai
            </button>
            {form.id ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                Xóa đơn
              </button>
            ) : null}
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
      </div>
    </section>
  );
}
