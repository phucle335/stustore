"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
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
  filterQuery?: string;
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

export function CouponManager({
  initialCoupons,
  filterQuery = "",
}: CouponManagerProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [localQuery, setLocalQuery] = useState("");

  useEffect(() => {
    if (filterQuery.trim()) {
      setLocalQuery(filterQuery);
    }
  }, [filterQuery]);

  const visibleCoupons = useMemo(() => {
    const q = (filterQuery.trim() || localQuery.trim()).toLowerCase();
    if (!q) return coupons;
    return coupons.filter((coupon) =>
      [coupon.code, coupon.description, coupon.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [coupons, filterQuery, localQuery]);
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
        setMessage("Coupon updated.");
      } else {
        setCoupons((prev) => [result.data, ...prev]);
        setMessage("Coupon created.");
        resetForm();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    startTransition(async () => {
      const result = await deleteCouponAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCoupons((prev) => prev.filter((row) => row.id !== id));
      if (form.id === id) resetForm();
      setMessage("Coupon deleted.");
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="admin-card"
      >
        <h3 className="text-lg font-semibold admin-text">
          {form.id ? "Edit Coupon" : "Create Coupon"}
        </h3>
        <p className="mt-1 text-sm admin-muted">
          Customer enters the code at checkout or in the Member Account.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm admin-text">
            Coupon Code *
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
            Description
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
              Type
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
                <option value="fixed">Fixed Amount</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </label>
            <label className="block text-sm admin-text">
              Value *
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
            Min Order
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
            Max Uses (leave blank = unlimited)
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
            Expires
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
            Active
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
            {form.id ? "Update" : "Create Code"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={resetForm}
              className="admin-btn"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-card">
        <h3 className="text-lg font-semibold admin-text">Code List</h3>
        <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
          {coupons.length === 0 ? (
            <li className="text-sm text-slate-500">No coupons yet.</li>
          ) : (
            visibleCoupons.map((coupon) => (
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
                      ? `${coupon.discount_value}% off`
                      : `${formatCurrency(coupon.discount_value)} off`}
                    {" · "}Used {coupon.used_count}
                    {coupon.max_uses != null ? `/${coupon.max_uses}` : ""}
                    {!coupon.is_active ? " · Disabled" : ""}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(coupon.id)}
                  className="text-slate-500 hover:text-red-400"
                  aria-label="Delete"
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
