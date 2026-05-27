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
import type { DbOrder, DbUser, OrderStatus } from "@/lib/supabase/types";

type OrderManagerProps = {
  initialOrders: DbOrder[];
  customers: DbUser[];
};

type OrderFormState = {
  id: string | null;
  user_id: string;
  total_price: string;
  deposit_amount: string;
  remaining_amount: string;
  status: OrderStatus;
};

const emptyOrderForm = (): OrderFormState => ({
  id: null,
  user_id: "",
  total_price: "",
  deposit_amount: "",
  remaining_amount: "",
  status: "pending_payment",
});

function orderToForm(order: DbOrder): OrderFormState {
  return {
    id: order.id,
    user_id: order.user_id ?? "",
    total_price: String(order.total_price),
    deposit_amount: String(order.deposit_amount ?? ""),
    remaining_amount: String(order.remaining_amount ?? ""),
    status: order.status,
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

export function OrderManager({ initialOrders, customers }: OrderManagerProps) {
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
    const deposit_amount = Number(form.deposit_amount || 0);
    const remaining_amount = Number(form.remaining_amount || 0);
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
        deposit_amount,
        remaining_amount,
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
            Cập nhật trạng thái và theo dõi doanh thu từng đơn
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
              Tổng tiền (VND)
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
              Đã cọc (VND)
              <input
                type="number"
                min={0}
                value={form.deposit_amount}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    deposit_amount: e.target.value,
                  }))
                }
                className="admin-input mt-1.5"
              />
            </label>

            <label className="block text-sm admin-text">
              Còn lại (VND)
              <input
                type="number"
                min={0}
                value={form.remaining_amount}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    remaining_amount: e.target.value,
                  }))
                }
                className="admin-input mt-1.5"
              />
            </label>

            <label className="block text-sm admin-text sm:col-span-2">
              Trạng thái
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
          </div>

          {form.id ? (
            <p className="text-xs admin-muted">
              Mã đơn: <span className="font-mono text-[#334155]">{form.id}</span>
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
              {isPending ? "Đang lưu…" : form.id ? "Cập nhật đơn" : "Tạo đơn"}
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
        </div>
      </div>
    </section>
  );
}
