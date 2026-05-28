"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Minus, Plus, Settings, Trash2 } from "lucide-react";
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
  product_id: string;
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
  product_id: "",
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
    product_id: product.id,
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
  const [tab, setTab] = useState<"all" | "in_stock" | "pre_order">("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<StoreProductCategory | "all">(
    "all",
  );
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [sortBy, setSortBy] = useState<
    "created_newest" | "created_oldest" | "price_asc" | "price_desc" | "name_asc" | "name_desc"
  >("created_newest");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in_stock" | "out_stock" | "low_stock"
  >("all");
  const [form, setForm] = useState<ProductFormState>(() =>
    initialProducts.length > 0 ? productToForm(initialProducts[0]) : emptyForm(),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("admin-product-filters");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        categoryFilter?: StoreProductCategory | "all";
        brandFilter?: string;
        dateSort?: "newest" | "oldest";
        sortBy?:
          | "created_newest"
          | "created_oldest"
          | "price_asc"
          | "price_desc"
          | "name_asc"
          | "name_desc";
        stockFilter?: "all" | "in_stock" | "out_stock" | "low_stock";
        query?: string;
      };
      if (parsed.categoryFilter) setCategoryFilter(parsed.categoryFilter);
      if (parsed.brandFilter) setBrandFilter(parsed.brandFilter);
      if (parsed.dateSort) setDateSort(parsed.dateSort);
      if (parsed.sortBy) setSortBy(parsed.sortBy);
      if (parsed.stockFilter) setStockFilter(parsed.stockFilter);
      if (parsed.query) {
        setQueryInput(parsed.query);
        setQuery(parsed.query);
      }
    } catch {
      // ignore invalid saved filters
    }
  }, []);

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

  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => (p.brand_tag ?? "").trim())
            .filter((v) => v.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const productRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...products]
      .filter((p) => {
        const fulfillment = p.fulfillment_type ?? "in_stock";
        if (tab !== "all" && fulfillment !== tab) return false;
        if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
        if (brandFilter !== "all" && p.brand_tag !== brandFilter) return false;

        const sizes = Array.isArray(p.sizes) ? p.sizes : [];
        const stock = sizes.reduce((sum, row) => sum + (Number(row?.quantity) || 0), 0);
        if (stockFilter === "out_stock" && stock > 0) return false;
        if (stockFilter === "in_stock" && stock <= 0) return false;
        if (stockFilter === "low_stock" && !(stock > 0 && stock <= 5)) return false;

        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.brand_tag.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        sortBy === "created_oldest"
          ? a.created_at.localeCompare(b.created_at)
          : sortBy === "price_asc"
            ? Number(a.price) - Number(b.price)
            : sortBy === "price_desc"
              ? Number(b.price) - Number(a.price)
              : sortBy === "name_asc"
                ? (a.name ?? "").localeCompare(b.name ?? "", "vi")
                : sortBy === "name_desc"
                  ? (b.name ?? "").localeCompare(a.name ?? "", "vi")
                  : b.created_at.localeCompare(a.created_at),
      );
  }, [products, query, tab, categoryFilter, brandFilter, stockFilter, dateSort, sortBy]);

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
          id?: string;
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
    const customId = form.product_id.trim();

    if (!form.id && customId) {
      const duplicated = products.some(
        (p) => p.id.trim().toLowerCase() === customId.toLowerCase(),
      );
      if (duplicated) {
        return { error: "Product ID đã tồn tại. Vui lòng nhập ID khác." };
      }
    }

    if (imageFieldsToArray(form.images).length === 0) {
      return { error: "Cần ít nhất một ảnh (ảnh 1)." };
    }

    const sizes = sizesToDbPayload(form.category, form.sizes);

    if (!isCategoryWithoutSizes(form.category) && sizes.length === 0) {
      return { error: "Vui lòng nhập ít nhất một size và số lượng." };
    }

    return {
      payload: {
        id: form.id ? undefined : customId || undefined,
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
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold admin-text">Danh sách sản phẩm</h2>
          <p className="text-sm admin-muted">
            Sắp xếp và quản lý toàn bộ sản phẩm theo layout bảng mới.
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="admin-btn">Xuất file</button>
          <button type="button" className="admin-btn">Nhập file</button>
          <button
            type="button"
            className="admin-btn"
            onClick={() => {
              setCategoryFilter("all");
              setBrandFilter("all");
              setDateSort("newest");
              setSortBy("created_newest");
              setStockFilter("all");
              setQueryInput("");
              setQuery("");
            }}
          >
            Reset lọc
          </button>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="admin-btn admin-btn--primary"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className={`admin-btn ${tab === "all" ? "admin-btn--primary" : ""}`}
          onClick={() => setTab("all")}
        >
          Tất cả sản phẩm
        </button>
        <button
          type="button"
          className={`admin-btn ${tab === "in_stock" ? "admin-btn--primary" : ""}`}
          onClick={() => setTab("in_stock")}
        >
          Hàng có sẵn
        </button>
        <button
          type="button"
          className={`admin-btn ${tab === "pre_order" ? "admin-btn--primary" : ""}`}
          onClick={() => setTab("pre_order")}
        >
          Pre-order
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-[var(--admin-border)] p-3 admin-product-filter-row">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="admin-input flex-1 min-w-[240px] max-md:min-w-full"
            placeholder="Tìm kiếm sản phẩm"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
          />
          <select
            className="admin-input w-[160px] max-md:w-full"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as StoreProductCategory | "all")
            }
          >
            <option value="all">Loại sản phẩm</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="admin-input w-[140px] max-md:w-full"
            value={dateSort}
            onChange={(e) => setDateSort(e.target.value as "newest" | "oldest")}
          >
            <option value="newest">Ngày tạo mới</option>
            <option value="oldest">Ngày tạo cũ</option>
          </select>
          <select
            className="admin-input w-[160px] max-md:w-full"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "created_newest"
                  | "created_oldest"
                  | "price_asc"
                  | "price_desc"
                  | "name_asc"
                  | "name_desc",
              )
            }
          >
            <option value="created_newest">Mới nhất</option>
            <option value="created_oldest">Cũ nhất</option>
            <option value="price_asc">Giá thấp tới cao</option>
            <option value="price_desc">Giá cao tới thấp</option>
            <option value="name_asc">Tên A tới Z</option>
            <option value="name_desc">Tên Z tới A</option>
          </select>
          <select
            className="admin-input w-[140px] max-md:w-full"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">Nhãn hiệu</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <select
            className="admin-input w-[140px] max-md:w-full"
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(
                e.target.value as "all" | "in_stock" | "out_stock" | "low_stock",
              )
            }
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="in_stock">Còn hàng</option>
            <option value="out_stock">Hết hàng</option>
            <option value="low_stock">Sắp hết (&le;5)</option>
          </select>
          <button type="button" className="admin-btn" onClick={() => setQuery(queryInput)}>
            Tìm
          </button>
          <button
            type="button"
            className="admin-btn"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem(
                  "admin-product-filters",
                  JSON.stringify({
                    categoryFilter,
                    brandFilter,
                    dateSort,
                    sortBy,
                    stockFilter,
                    query: queryInput,
                  }),
                );
              }
              setMessage("Đã lưu bộ lọc.");
              setError(null);
            }}
          >
            Lưu bộ lọc
          </button>
        </div>
      </div>

      <div className="admin-table-wrap mb-6 hidden md:block">
        <table className="admin-table admin-product-table">
          <thead>
            <tr>
              <th>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <input type="checkbox" />
                  <span>&gt;&gt;</span>
                </div>
              </th>
              <th>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Tồn kho</th>
              <th>Có thể bán</th>
              <th>Ngày khởi tạo</th>
              <th>Loại</th>
              <th>Nhãn hiệu</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {productRows.map((product) => {
              const sizes = Array.isArray(product.sizes) ? product.sizes : [];
              const stock = sizes.reduce(
                (sum, row) => sum + (Number(row?.quantity) || 0),
                0,
              );
              const variants = Math.max(1, sizes.length);
              return (
                <tr
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td>
                    <div className="h-10 w-10 rounded bg-white/10" />
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <strong className="admin-text">{product.name}</strong>
                      <span className="admin-muted text-xs">ID: {product.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <strong className="admin-text">{stock}</strong>
                      <span className="admin-muted text-xs">({variants} phiên bản)</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <strong className="admin-text">{stock}</strong>
                      <span className="admin-muted text-xs">({variants} phiên bản)</span>
                    </div>
                  </td>
                  <td>{new Date(product.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>{product.category}</td>
                  <td>{product.brand_tag}</td>
                  <td>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
                      Đang bán
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-6 space-y-3 md:hidden">
        {productRows.map((product) => {
          const sizes = Array.isArray(product.sizes) ? product.sizes : [];
          const stock = sizes.reduce((sum, row) => sum + (Number(row?.quantity) || 0), 0);
          const variants = Math.max(1, sizes.length);
          const active = form.id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => selectProduct(product)}
              className={`w-full rounded-xl border border-[var(--admin-border)] p-3 text-left ${
                active ? "bg-[rgba(242,78,53,0.16)]" : "bg-[var(--admin-surface)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="admin-text text-sm font-semibold">{product.name}</p>
                  <p className="admin-muted text-xs">ID: {product.id}</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                  Đang bán
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <p className="admin-muted">Loại: <span className="admin-text">{product.category}</span></p>
                <p className="admin-muted">Nhãn hiệu: <span className="admin-text">{product.brand_tag}</span></p>
                <p className="admin-muted">Tồn kho: <span className="admin-text">{stock}</span></p>
                <p className="admin-muted">Biến thể: <span className="admin-text">{variants}</span></p>
                <p className="admin-muted">Giá: <span className="admin-text">{formatCurrency(product.price)}</span></p>
                <p className="admin-muted">
                  Ngày tạo:{" "}
                  <span className="admin-text">
                    {new Date(product.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-5">
        <p className="text-sm admin-muted">
            {noSizeCategory
              ? "+ Tồn kho"
              : "Tăng/giảm tồn kho theo từng size"}{" "}
            — tổng:{" "}
            <span className="font-medium admin-text">{totalStock}</span>{" "}
            {noSizeCategory ? "sản phẩm" : "đôi"}
          </p>
      </div>

      <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm admin-text">
              Product ID (tracking)
              <input
                value={form.product_id}
                onChange={(e) =>
                  setForm((current) => ({ ...current, product_id: e.target.value }))
                }
                disabled={Boolean(form.id)}
                className="admin-input mt-1.5"
                placeholder="ví dụ: f2b2b4b2-...."
              />
            </label>
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
                    <span
                      className="min-w-[4rem] text-center text-lg font-semibold tabular-nums admin-text"
                      aria-label="Số lượng hiện tại"
                    >
                      {form.sizes[0]?.quantity ?? 0}
                    </span>
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
    </section>
  );
}
