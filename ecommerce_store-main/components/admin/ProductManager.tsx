"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/lib/admin/actions/products";
import type {
  DbProduct,
  ProductSizeStock,
  StoreProductCategory,
} from "@/lib/supabase/types";
import { ProductImageFields } from "@/components/admin/ProductImageFields";
import { formatCurrency } from "@/components/admin/format";
import {
  emptyImageFields,
  imageFieldsToArray,
  imageFieldsToDbPayload,
  productToImageFields,
} from "@/lib/admin/product-images";
import type { ProductImageFormState } from "@/lib/admin/product-images";
import {
  isCategoryWithoutSizes,
  sizesToDbPayload,
  sizesToFormState,
  totalQuantityFromSizeRows,
} from "@/lib/store/product-category-rules";

const CATEGORY_OPTIONS: { value: StoreProductCategory; label: string }[] = [
  { value: "sneakers", label: "Giày Sneaker" },
  { value: "sunglasses", label: "Kính mát" },
  { value: "clothing", label: "Quần áo" },
  { value: "bags", label: "Túi xách" },
  { value: "watches", label: "Đồng hồ" },
];

type ProductManagerProps = {
  initialProducts: DbProduct[];
};

type ProductFormState = {
  id: string | null;
  name: string;
  brand_tag: string;
  category: StoreProductCategory;
  fulfillment_type: "in_stock" | "pre_order";
  price: string;
  sale_percent: string;
  description: string;
  images: ProductImageFormState;
  sizes: ProductSizeStock[];
};

const emptyForm = (): ProductFormState => ({
  id: null,
  name: "",
  brand_tag: "",
  category: "sneakers",
  fulfillment_type: "in_stock",
  price: "",
  sale_percent: "0",
  description: "",
  images: emptyImageFields(),
  sizes: [{ size: "40", quantity: 0 }],
});

function productToForm(product: DbProduct): ProductFormState {
  const category = product.category ?? "sneakers";
  return {
    id: product.id,
    name: product.name ?? "",
    brand_tag: product.brand_tag ?? "",
    category,
    fulfillment_type: product.fulfillment_type ?? "in_stock",
    price: String(product.price ?? ""),
    sale_percent: String(product.sale_percent ?? 0),
    description: product.description ?? "",
    images: productToImageFields(product),
    sizes: sizesToFormState(category, product.sizes),
  };
}

export function ProductManager({ initialProducts }: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<ProductFormState>(() =>
    initialProducts.length > 0 ? productToForm(initialProducts[0]) : emptyForm(),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (products.length === 0) {
      setForm(emptyForm());
      return;
    }
    if (form.id && !products.some((p) => p.id === form.id)) {
      setForm(productToForm(products[0]));
    }
  }, [products, form.id]);

  const noSizeCategory = isCategoryWithoutSizes(form.category);

  const totalStock = useMemo(
    () => totalQuantityFromSizeRows(form.sizes),
    [form.sizes],
  );

  function handleCategoryChange(category: StoreProductCategory) {
    setForm((current) => {
      const qty = totalQuantityFromSizeRows(current.sizes);
      return {
        ...current,
        category,
        sizes: isCategoryWithoutSizes(category)
          ? [{ size: "", quantity: qty }]
          : current.sizes.some((row) => row.size?.trim())
            ? current.sizes
            : [{ size: "40", quantity: qty }],
      };
    });
  }

  function selectProduct(product: DbProduct) {
    setForm(productToForm(product));
    setMessage(null);
    setError(null);
  }

  function resetForm() {
    setForm(emptyForm());
    setMessage(null);
    setError(null);
  }

  function updateSize(index: number, patch: Partial<ProductSizeStock>) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    }));
  }

  function adjustQuantity(index: number, delta: number) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.map((row, i) =>
        i === index
          ? { ...row, quantity: Math.max(0, row.quantity + delta) }
          : row,
      ),
    }));
  }

  function addSizeRow() {
    setForm((current) => ({
      ...current,
      sizes: [...current.sizes, { size: "", quantity: 0 }],
    }));
  }

  function removeSizeRow(index: number) {
    setForm((current) => ({
      ...current,
      sizes:
        current.sizes.length === 1
          ? [{ size: "", quantity: 0 }]
          : current.sizes.filter((_, i) => i !== index),
    }));
  }

  function parsePayload():
    | { error: string }
    | {
        payload: {
          name: string;
          brand_tag: string;
          category: StoreProductCategory;
          fulfillment_type: "in_stock" | "pre_order";
          price: number;
          sale_percent: number;
          description: string | null;
          sizes: ProductSizeStock[];
        } & ReturnType<typeof imageFieldsToDbPayload>;
      } {
    const price = Number(form.price);
    const salePercentRaw = Number(form.sale_percent);
    if (
      !form.name.trim() ||
      !form.brand_tag.trim() ||
      Number.isNaN(price) ||
      Number.isNaN(salePercentRaw)
    ) {
      return { error: "Vui lòng nhập tên, thương hiệu, giá hợp lệ và % sale." };
    }
    const sale_percent = Math.max(0, Math.min(50, salePercentRaw));

    if (imageFieldsToArray(form.images).length === 0) {
      return { error: "Cần ít nhất một ảnh (ảnh 1)." };
    }

    const sizes = sizesToDbPayload(form.category, form.sizes);

    if (!isCategoryWithoutSizes(form.category) && sizes.length === 0) {
      return { error: "Vui lòng nhập ít nhất một size và số lượng." };
    }

    return {
      payload: {
        name: form.name.trim(),
        brand_tag: form.brand_tag.trim().toLowerCase(),
        category: form.category,
        fulfillment_type: form.fulfillment_type,
        price,
        sale_percent,
        description: form.description.trim() || null,
        sizes,
        ...imageFieldsToDbPayload(form.images),
      },
    };
  }

  function handleSave() {
    const parsed = parsePayload();
    if ("error" in parsed) {
      setError(parsed.error);
      return;
    }

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = form.id
        ? await updateProductAction(form.id, parsed.payload)
        : await createProductAction(parsed.payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setProducts((current) => {
        if (form.id) {
          return current.map((item) =>
            item.id === result.data.id ? result.data : item,
          );
        }
        return [result.data, ...current];
      });
      setForm(productToForm(result.data));
      setMessage(form.id ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.");
    });
  }

  function handleDelete() {
    if (!form.id) return;
    if (!window.confirm("Xóa sản phẩm này?")) return;

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = await deleteProductAction(form.id!);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setProducts((current) => current.filter((item) => item.id !== form.id));
      resetForm();
      setMessage("Đã xóa sản phẩm.");
    });
  }

  return (
    <section className="admin-panel">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold admin-text">Quản lý sản phẩm</h2>
          <p className="text-sm admin-muted">
            {noSizeCategory
              ? "Số lượng tồn kho"
              : "Tăng/giảm tồn kho theo từng size"}{" "}
            — tổng:{" "}
            <span className="font-medium text-[#1e2a3a]">{totalStock}</span>{" "}
            {noSizeCategory ? "sản phẩm" : "đôi"}
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="admin-btn admin-btn--primary"
        >
          + Sản phẩm mới
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="admin-list-aside space-y-2">
          {products.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm admin-muted">
              Chưa có sản phẩm
            </p>
          ) : (
            products.map((product) => {
              const sizes = Array.isArray(product.sizes) ? product.sizes : [];
              const stock = sizes.reduce(
                (sum, row) => sum + (Number(row?.quantity) || 0),
                0,
              );
              const active = form.id === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => selectProduct(product)}
                  aria-pressed={active}
                  className={`admin-list-item${active ? " is-active" : ""}`}
                >
                  <p className="truncate text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-xs admin-muted">
                    {product.category} · {product.brand_tag} ·{" "}
                    {formatCurrency(product.price)} · {stock}{" "}
                    {isCategoryWithoutSizes(product.category) ? "sp" : "đôi"}
                  </p>
                </button>
              );
            })
          )}
        </aside>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm admin-text">
              Tên sản phẩm
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                className="admin-input mt-1.5"
              />
            </label>
            <label className="block text-sm admin-text">
              Thương hiệu (brand_tag)
              <input
                value={form.brand_tag}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    brand_tag: e.target.value,
                  }))
                }
                className="admin-input mt-1.5"
                placeholder="nike, adidas…"
              />
            </label>
            <label className="block text-sm admin-text">
              Danh mục
              <select
                value={form.category}
                onChange={(e) =>
                  handleCategoryChange(e.target.value as StoreProductCategory)
                }
                className="admin-input mt-1.5"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm admin-text">
              Loại fulfillment
              <select
                value={form.fulfillment_type}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    fulfillment_type: e.target.value as "in_stock" | "pre_order",
                  }))
                }
                className="admin-input mt-1.5"
              >
                <option value="in_stock">Hàng có sẵn</option>
                <option value="pre_order">Pre-order</option>
              </select>
            </label>
            <label className="block text-sm admin-text">
              Giá gốc (VND)
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((current) => ({ ...current, price: e.target.value }))
                }
                className="admin-input mt-1.5"
              />
            </label>

            <label className="block text-sm admin-text">
              % sale (0-50)
              <input
                type="number"
                min={0}
                max={50}
                value={form.sale_percent}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    sale_percent: e.target.value,
                  }))
                }
                className="admin-input mt-1.5"
              />
            </label>
          </div>

          <ProductImageFields
            value={form.images}
            onChange={(images) => setForm((current) => ({ ...current, images }))}
            disabled={isPending}
          />

          <label className="block text-sm admin-text">
            Mô tả
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              className="admin-input mt-1.5 resize-y"
            />
          </label>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold admin-text">
                {noSizeCategory ? "Tồn kho" : "Tồn kho theo size"}
              </h3>
              {!noSizeCategory ? (
                <button
                  type="button"
                  onClick={addSizeRow}
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  + Thêm size
                </button>
              ) : null}
            </div>

            {noSizeCategory ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                <label className="text-sm admin-text">
                  Số lượng còn lại
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Giảm số lượng"
                      onClick={() => adjustQuantity(0, -1)}
                      className="admin-icon-btn"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={form.sizes[0]?.quantity ?? 0}
                      onChange={(e) =>
                        updateSize(0, {
                          quantity: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="admin-input w-24 text-center tabular-nums"
                    />
                    <button
                      type="button"
                      aria-label="Tăng số lượng"
                      onClick={() => adjustQuantity(0, 1)}
                      className="admin-icon-btn"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {form.sizes.map((row, index) => (
                  <div
                    key={`${index}-${row.size}`}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3"
                  >
                    <input
                      value={row.size ?? ""}
                      onChange={(e) =>
                        updateSize(index, { size: e.target.value })
                      }
                      placeholder="Size"
                      className="admin-input w-20 text-center text-sm font-semibold"
                    />

                    <div className="flex items-center gap-1 rounded-lg border border-[var(--admin-border)] bg-white p-1">
                      <button
                        type="button"
                        aria-label={`Giảm size ${row.size}`}
                        onClick={() => adjustQuantity(index, -1)}
                        className="admin-icon-btn !h-9 !w-9"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[3rem] text-center text-lg font-semibold tabular-nums admin-text">
                        {row.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Tăng size ${row.size}`}
                        onClick={() => adjustQuantity(index, 1)}
                        className="admin-icon-btn !h-9 !w-9"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSizeRow(index)}
                      className="admin-icon-btn ml-auto !h-9 !w-9"
                      aria-label="Xóa size"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {isPending ? "Đang lưu…" : form.id ? "Cập nhật" : "Tạo sản phẩm"}
            </button>
            {form.id ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                Xóa
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
