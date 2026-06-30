"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  createProductAction,
  deleteProductAction,
  deleteProductsBulkAction,
  updateProductAction,
  updateProductsStatusBulkAction,
} from "@/lib/admin/actions/products";
import type {
  DbProduct,
  ProductStatus,
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
  type ProductImageFormState,
} from "@/lib/admin/product-images";
import {
  getProductManageCode,
  normalizeProductCode,
  productCodeValidationMessage,
} from "@/lib/store/product-id";
import {
  isCategoryWithoutSizes,
  sizesToDbPayload,
  sizesToFormState,
  totalQuantityFromSizeRows,
} from "@/lib/store/product-category-rules";

const CATEGORY_OPTIONS: { value: StoreProductCategory; label: string }[] = [
  { value: "sneakers", label: "Sneakers" },
  { value: "sunglasses", label: "Sunglasses" },
  { value: "clothing", label: "Clothing" },
  { value: "bags", label: "Bags" },
  { value: "watches", label: "Watches" },
];

type ProductManagerProps = {
  initialProducts: DbProduct[];
  filterQuery?: string;
};

type ProductFormState = {
  product_id: string;
  id: string | null;
  name: string;
  brand_tag: string;
  category: StoreProductCategory;
  fulfillment_type: "in_stock" | "pre_order";
  product_status: ProductStatus;
  price: string;
  origin_price: string;
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
  product_status: "selling",
  price: "",
  origin_price: "",
  sale_percent: "0",
  description: "",
  images: emptyImageFields(),
  sizes: [{ size: "40", quantity: 0 }],
});

function productToForm(product: DbProduct): ProductFormState {
  const category = product.category ?? "sneakers";
  return {
    product_id: product.product_code ?? "",
    id: product.id,
    name: product.name ?? "",
    brand_tag: product.brand_tag ?? "",
    category,
    fulfillment_type: product.fulfillment_type ?? "in_stock",
    product_status:
      product.product_status === "out_of_stock" ||
      product.product_status === "paused"
        ? product.product_status
        : "selling",
    price: String(product.price ?? ""),
    origin_price: String(product.origin_price ?? ""),
    sale_percent: String(product.sale_percent ?? 0),
    description: product.description ?? "",
    images: productToImageFields(product),
    sizes: sizesToFormState(category, product.sizes),
  };
}

const PRODUCT_PAGE_SIZE = 12;
const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  selling: "Active",
  out_of_stock: "Out of Stock",
  paused: "Paused",
};

function getProductStock(product: DbProduct): { stock: number; variants: number } {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const stock = sizes.reduce((sum, row) => sum + (Number(row?.quantity) || 0), 0);
  return { stock, variants: Math.max(1, sizes.length) };
}

function resolveDisplayStatus(product: DbProduct): ProductStatus {
  const { stock } = getProductStock(product);
  if (stock <= 0) return "out_of_stock";
  if (
    product.product_status === "paused" ||
    product.product_status === "out_of_stock"
  ) {
    return product.product_status;
  }
  return "selling";
}

function statusBadgeClass(status: ProductStatus): string {
  if (status === "out_of_stock") {
    return "bg-red-500/15 text-red-300 ring-1 ring-red-500/35";
  }
  if (status === "paused") {
    return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/35";
  }
  return "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30";
}

export function ProductManager({
  initialProducts,
  filterQuery = "",
}: ProductManagerProps) {
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
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkStatus, setBulkStatus] = useState<ProductStatus>("selling");
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
    if (filterQuery.trim()) {
      setQueryInput(filterQuery);
      setQuery(filterQuery);
    }
  }, [filterQuery]);

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
        const manageCode = getProductManageCode(p).toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          manageCode.includes(q) ||
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

  const totalPages = Math.max(1, Math.ceil(productRows.length / PRODUCT_PAGE_SIZE));
  const pagedProductRows = useMemo(
    () =>
      productRows.slice(
        (page - 1) * PRODUCT_PAGE_SIZE,
        page * PRODUCT_PAGE_SIZE,
      ),
    [productRows, page],
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [tab, query, categoryFilter, brandFilter, stockFilter, sortBy, dateSort]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageIds = useMemo(
    () => pagedProductRows.map((p) => p.id),
    [pagedProductRows],
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allPageSelected;

  function toggleSelectAllOnPage() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  }

  function toggleSelectId(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected products?`)) return;

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = await deleteProductsBulkAction(ids);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setProducts((current) => current.filter((item) => !selectedIds.has(item.id)));
      if (form.id && selectedIds.has(form.id)) {
        resetForm();
      }
      setSelectedIds(new Set());
      setMessage(`${result.data.count} products deleted.`);
    });
  }

  function handleBulkStatusApply() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    startTransition(async () => {
      setError(null);
      setMessage(null);

      const result = await updateProductsStatusBulkAction(ids, bulkStatus);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setProducts((current) =>
        current.map((item) =>
          selectedIds.has(item.id)
            ? { ...item, product_status: bulkStatus }
            : item,
        ),
      );
      if (form.id && selectedIds.has(form.id)) {
        setForm((current) => ({ ...current, product_status: bulkStatus }));
      }
      setSelectedIds(new Set());
      setMessage(
        `Updated status of ${result.data.count} products → ${PRODUCT_STATUS_LABELS[bulkStatus]}.`,
      );
    });
  }

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
          product_code?: string | null;
          name: string;
          brand_tag: string;
          category: StoreProductCategory;
          fulfillment_type: "in_stock" | "pre_order";
          product_status: ProductStatus;
          price: number;
          origin_price: number | null;
          sale_percent: number;
          description: string | null;
          sizes: ProductSizeStock[];
        } & ReturnType<typeof imageFieldsToDbPayload>;
      } {
    const price = Number(form.price);
    const originPriceRaw = form.origin_price.trim();
    const origin_price = originPriceRaw ? Number(originPriceRaw) : null;
    const salePercentRaw = Number(form.sale_percent);
    if (
      !form.name.trim() ||
      !form.brand_tag.trim() ||
      Number.isNaN(price) ||
      Number.isNaN(salePercentRaw)
    ) {
      return { error: "Please enter a valid name, brand, price, and discount %." };
    }
    if (originPriceRaw && Number.isNaN(origin_price)) {
      return { error: "Invalid origin price." };
    }
    const sale_percent = Math.max(0, Math.min(50, salePercentRaw));
    const rawCode = form.product_id.trim();
    const productCode = normalizeProductCode(rawCode);

    if (rawCode && !productCode) {
      return { error: productCodeValidationMessage() };
    }

    if (productCode) {
      const duplicated = products.some((p) => {
        if (form.id && p.id === form.id) return false;
        const existing = p.product_code?.trim().toLowerCase();
        return existing === productCode.toLowerCase();
      });
      if (duplicated) {
        return { error: `Product code "${productCode}" already exists. Please choose a different code.` };
      }
    }

    if (imageFieldsToArray(form.images).length === 0) {
      return { error: "At least one image is required (image 1)." };
    }

    const sizes = sizesToDbPayload(form.category, form.sizes);
    const stock = totalQuantityFromSizeRows(sizes);
    const productStatus: ProductStatus =
      stock <= 0 ? "out_of_stock" : form.product_status;

    if (!isCategoryWithoutSizes(form.category) && sizes.length === 0) {
      return { error: "Please enter at least one size and quantity." };
    }

    return {
      payload: {
        product_code: productCode ?? null,
        name: form.name.trim(),
        brand_tag: form.brand_tag.trim().toLowerCase(),
        category: form.category,
        fulfillment_type: form.fulfillment_type,
        product_status: productStatus,
        price,
        origin_price,
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
      setMessage(form.id ? "Product updated." : "New product added.");
    });
  }

  function handleDelete() {
    if (!form.id) return;
    if (!window.confirm("Delete this product?")) return;

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
      setMessage("Product deleted.");
    });
  }

  return (
    <section className="admin-panel">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold admin-text">Product List</h2>
          <p className="text-sm admin-muted">
            Arrange and manage all products in the new table layout.
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="admin-btn">Export</button>
          <button type="button" className="admin-btn">Import</button>
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
            Reset Filters
          </button>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="admin-btn admin-btn--primary"
        >
          + Add Product
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className={`admin-btn ${tab === "all" ? "admin-btn--primary" : ""}`}
          onClick={() => setTab("all")}
        >
          All Products
        </button>
        <button
          type="button"
          className={`admin-btn ${tab === "in_stock" ? "admin-btn--primary" : ""}`}
          onClick={() => setTab("in_stock")}
        >
          In Stock
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
            placeholder="Search products"
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
            <option value="all">Product Type</option>
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
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
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
            <option value="created_newest">Newest</option>
            <option value="created_oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
          <select
            className="admin-input w-[140px] max-md:w-full"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">Brand</option>
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
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_stock">Out of Stock</option>
            <option value="low_stock">Low Stock (&le;5)</option>
          </select>
          <button type="button" className="admin-btn" onClick={() => setQuery(queryInput)}>
            Search
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
              setMessage("Filters saved.");
              setError(null);
            }}
          >
            Save Filters
          </button>
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <div className="admin-card admin-bulk-bar mb-4">
          <span className="text-sm admin-text">
            <strong>{selectedIds.size}</strong> products selected
          </span>
          <select
            className="admin-input"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as ProductStatus)}
            disabled={isPending}
          >
            {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((status) => (
              <option key={status} value={status}>
                {PRODUCT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleBulkStatusApply}
            disabled={isPending}
          >
            Apply Status
          </button>
          <button
            type="button"
            className="admin-btn"
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-1 inline h-4 w-4" />
            Delete Selected
          </button>
          <button
            type="button"
            className="admin-btn"
            onClick={() => setSelectedIds(new Set())}
            disabled={isPending}
          >
            Deselect
          </button>
        </div>
      ) : null}

      <div className="admin-table-wrap mb-6 admin-only-desktop">
        <table className="admin-table admin-product-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={toggleSelectAllOnPage}
                  aria-label="Select all on page"
                />
              </th>
              <th>Image</th>
              <th>Product</th>
              <th>Stock</th>
              <th>Available to Sell</th>
              <th>Created</th>
              <th>Type</th>
              <th>Brand</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedProductRows.map((product) => {
              const { stock, variants } = getProductStock(product);
              const displayStatus = resolveDisplayStatus(product);
              const thumb = imageFieldsToArray(productToImageFields(product))[0] ?? null;
              return (
                <tr
                  key={product.id}
                  onClick={() => selectProduct(product)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelectId(product.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td>
                    <div className="admin-product-thumb">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt={product.name} className="admin-product-thumb__img" />
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <strong className="admin-text">{product.name}</strong>
                      <span className="admin-muted text-xs">
                        Code: {getProductManageCode(product)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <strong className="admin-text">{stock}</strong>
                      <span className="admin-muted text-xs">({variants} variants)</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <strong className="admin-text">{stock}</strong>
                      <span className="admin-muted text-xs">({variants} variants)</span>
                    </div>
                  </td>
                  <td>{new Date(product.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>{product.category}</td>
                  <td>{product.brand_tag}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(displayStatus)}`}
                    >
                      {PRODUCT_STATUS_LABELS[displayStatus]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-select-bar admin-only-mobile">
        <label className="admin-mobile-select-all">
          <input
            type="checkbox"
            checked={allPageSelected}
            ref={(el) => {
              if (el) el.indeterminate = somePageSelected;
            }}
            onChange={toggleSelectAllOnPage}
          />
          Select all on page ({pageIds.length})
        </label>
      </div>

      <div className="admin-product-mobile-list admin-only-mobile mb-6">
        {pagedProductRows.map((product) => {
          const { stock, variants } = getProductStock(product);
          const displayStatus = resolveDisplayStatus(product);
          const active = form.id === product.id;
          const isSelected = selectedIds.has(product.id);
          return (
            <div
              key={product.id}
              className={`admin-mobile-select-card${isSelected ? " is-selected" : ""}${active ? " is-active" : ""}`}
            >
              <div className="admin-mobile-select-card__check">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectId(product.id)}
                  aria-label={`Select ${product.name}`}
                />
              </div>
              <button
                type="button"
                className="admin-mobile-select-card__body"
                onClick={() => selectProduct(product)}
              >
                    <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="admin-text text-sm font-semibold">{product.name}</p>
                    <p className="admin-muted text-xs">
                      Code: {getProductManageCode(product)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(displayStatus)}`}
                  >
                    {PRODUCT_STATUS_LABELS[displayStatus]}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <p className="admin-muted">Type: <span className="admin-text">{product.category}</span></p>
                  <p className="admin-muted">Brand: <span className="admin-text">{product.brand_tag}</span></p>
                  <p className="admin-muted">Stock: <span className="admin-text">{stock}</span></p>
                  <p className="admin-muted">Variants: <span className="admin-text">{variants}</span></p>
                  <p className="admin-muted">Price: <span className="admin-text">{formatCurrency(product.price)}</span></p>
                  <p className="admin-muted">
                    Created:{" "}
                    <span className="admin-text">
                      {new Date(product.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs admin-muted">
          Page {page}/{totalPages} - {productRows.length} items
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="admin-btn"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>
          <button
            type="button"
            className="admin-btn"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm admin-muted">
            {noSizeCategory
              ? "+ Stock"
              : "Adjust stock per size"}{" "}
            — total:{" "}
            <span className="font-medium admin-text">{totalStock}</span>{" "}
            {noSizeCategory ? "items" : "pairs"}
          </p>
      </div>

      <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm admin-text">
              Product Code
              <input
                value={form.product_id}
                onChange={(e) =>
                  setForm((current) => ({ ...current, product_id: e.target.value }))
                }
                className="admin-input mt-1.5"
                placeholder="e.g. SP001, air-max-01"
              />
              <span className="mt-1 block text-xs admin-muted">
                {productCodeValidationMessage()} Can be left blank — system will generate internal UUID.
              </span>
            </label>
            <label className="block text-sm admin-text">
              Product Name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((current) => ({ ...current, name: e.target.value }))
                }
                className="admin-input mt-1.5"
              />
            </label>
            <label className="block text-sm admin-text">
              Brand
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
              Category
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
              Fulfillment Type
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
                <option value="in_stock">In Stock</option>
                <option value="pre_order">Pre-order</option>
              </select>
            </label>
            <label className="block text-sm admin-text">
              Product Status
              <select
                value={totalStock <= 0 ? "out_of_stock" : form.product_status}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    product_status: e.target.value as ProductStatus,
                  }))
                }
                className="admin-input mt-1.5"
                disabled={totalStock <= 0}
              >
                <option value="selling">Active</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label className="block text-sm admin-text">
              Selling Price (VND)
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
              Origin Price (VND)
              <input
                type="number"
                min={0}
                value={form.origin_price}
                onChange={(e) =>
                  setForm((current) => ({ ...current, origin_price: e.target.value }))
                }
                className="admin-input mt-1.5"
              />
              <span className="mt-1 block text-xs admin-muted">
                Cost price — profit per item = selling price − origin price
              </span>
            </label>

            <label className="block text-sm admin-text">
              % discount (0-50)
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
            Description
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
                {noSizeCategory ? "Stock" : "Stock by Size"}
              </h3>
              {!noSizeCategory ? (
                <button
                  type="button"
                  onClick={addSizeRow}
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  + Add Size
                </button>
              ) : null}
            </div>

            {noSizeCategory ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
                <label className="text-sm admin-text">
                  Remaining Quantity
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease Quantity"
                      onClick={() => adjustQuantity(0, -1)}
                      className="admin-icon-btn"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span
                      className="min-w-[4rem] text-center text-lg font-semibold tabular-nums admin-text"
                      aria-label="Current Quantity"
                    >
                      {form.sizes[0]?.quantity ?? 0}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase Quantity"
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

                    <div className="flex items-center gap-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1">
                      <button
                        type="button"
                        aria-label={`Decrease size ${row.size}`}
                        onClick={() => adjustQuantity(index, -1)}
                        className="admin-icon-btn !h-9 !w-9"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[3rem] rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-center text-lg font-semibold tabular-nums text-white">
                        {row.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase size ${row.size}`}
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
                      aria-label="Remove size"
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
              {isPending ? "Saving…" : form.id ? "Update" : "Create Product"}
            </button>
            {form.id ? (
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                Delete
              </button>
            ) : null}
          </div>
      </div>
    </section>
  );
}
