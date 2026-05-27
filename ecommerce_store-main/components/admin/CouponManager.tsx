"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  createCouponAction,
  deleteCouponAction,
  updateCouponAction,
} from "@/lib/admin/actions/coupons";
import { formatCurrency } from "@/components/admin/format";
import type { CouponDiscountType, DbCoupon } from "@/lib/supabase/types";

type CouponManagerProps = {
  initialCoupons: DbCoupon[];
};

type FormState = {
  id: string | null;
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: string;
  min_order_amount: string;
  max_uses: string;
  is_active: boolean;
  expires_at: string;
};

const emptyForm = (): FormState => ({
  id: null,
  code: "",
  description: "",
  discount_type: "fixed",
  discount_value: "",
  min_order_amount: "0",
  max_uses: "",
  is_active: true,
  expires_at: "",
});

function toForm(coupon: DbCoupon): FormState {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description ?? "",
    discount_type: coupon.discount_type,
    discount_value: String(coupon.discount_value),
    min_order_amount: String(coupon.min_order_amount),
    max_uses: coupon.max_uses != null ? String(coupon.max_uses) : "",
    is_active: coupon.is_active,
    expires_at: coupon.expires_at
      ? coupon.expires_at.slice(0, 16)
      : "",
  };
}

export function CouponManager({ initialCoupons }: CouponManagerProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setForm(emptyForm());
    setMessage(null);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const payload = {
      code: form.code,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      expires_at: form.expires_at
        ? new Date(form.expires_at).toISOString()
        : null,
    };

    startTransition(async () => {
      const result = form.id
        ? await updateCouponAction(form.id, payload)
        : await createCouponAction(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (form.id) {
        setCoupons((prev) =>
          prev.map((row) => (row.id === result.data.id ? result.data : row)),
        );
        setMessage("Đã cập nhật phiếu giảm giá.");
      } else {
        setCoupons((prev) => [result.data, ...prev]);
        setMessage("Đã tạo phiếu giảm giá.");
        resetForm();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Xóa phiếu giảm giá này?")) return;
    startTransition(async () => {
      const result = await deleteCouponAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCoupons((prev) => prev.filter((row) => row.id !== id));
      if (form.id === id) resetForm();
      setMessage("Đã xóa phiếu.");
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="admin-card"
      >
        <h3 className="text-lg font-semibold admin-text">
          {form.id ? "Sửa phiếu" : "Tạo phiếu giảm giá"}
        </h3>
        <p className="mt-1 text-sm admin-muted">
          Khách nhập mã khi thanh toán hoặc trong Tài khoản thành viên.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm admin-text">
            Mã phiếu *
            <input
              required
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              className="admin-input mt-1"
              placeholder="STU10"
            />
          </label>
          <label className="block text-sm admin-text">
            Mô tả
            <input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="admin-input mt-1"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm admin-text">
              Loại
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discount_type: e.target.value as CouponDiscountType,
                  }))
                }
                className="admin-input mt-1"
              >
                <option value="fixed">Số tiền (đ)</option>
                <option value="percent">Phần trăm (%)</option>
              </select>
            </label>
            <label className="block text-sm admin-text">
              Giá trị *
              <input
                required
                type="number"
                min={1}
                value={form.discount_value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount_value: e.target.value }))
                }
                className="admin-input mt-1"
              />
            </label>
          </div>
          <label className="block text-sm admin-text">
            Đơn tối thiểu (đ)
            <input
              type="number"
              min={0}
              value={form.min_order_amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, min_order_amount: e.target.value }))
              }
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-sm admin-text">
            Số lượt dùng tối đa (để trống = không giới hạn)
            <input
              type="number"
              min={1}
              value={form.max_uses}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_uses: e.target.value }))
              }
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-sm admin-text">
            Hết hạn
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) =>
                setForm((f) => ({ ...f, expires_at: e.target.value }))
              }
              className="admin-input mt-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm admin-text">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.checked }))
              }
            />
            Đang kích hoạt
          </label>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>
        ) : null}
        {message ? (
          <p className="mt-3 rounded-lg bg-[#1e2a3a]/10 px-3 py-2 text-sm text-[#1e2a3a]">{message}</p>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn--primary disabled:opacity-60"
          >
            {form.id ? "Cập nhật" : "Tạo mã"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={resetForm}
              className="admin-btn"
            >
              Hủy sửa
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-card">
        <h3 className="text-lg font-semibold admin-text">Danh sách mã</h3>
        <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
          {coupons.length === 0 ? (
            <li className="text-sm text-slate-500">Chưa có phiếu nào.</li>
          ) : (
            coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    setForm(toForm(coupon));
                    setError(null);
                    setMessage(null);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="font-mono font-semibold text-emerald-400">
                    {coupon.code}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {coupon.discount_type === "percent"
                      ? `Giảm ${coupon.discount_value}%`
                      : `Giảm ${formatCurrency(coupon.discount_value)}`}
                    {" · "}Đã dùng {coupon.used_count}
                    {coupon.max_uses != null ? `/${coupon.max_uses}` : ""}
                    {!coupon.is_active ? " · Tắt" : ""}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(coupon.id)}
                  className="text-slate-500 hover:text-red-400"
                  aria-label="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
