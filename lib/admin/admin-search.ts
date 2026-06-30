import { ADMIN_VIEW_LABELS, type AdminView } from "@/components/admin/layout/admin-views";
import { getProductManageCode } from "@/lib/store/product-id";
import type { DbCoupon, DbOrder, DbProduct, DbUser } from "@/lib/supabase/types";

export type AdminSearchResultKind =
  | "view"
  | "order"
  | "product"
  | "user"
  | "coupon";

export type AdminSearchResult = {
  id: string;
  view: AdminView;
  kind: AdminSearchResultKind;
  label: string;
  subtitle?: string;
  /** Order id, product id, user id, coupon code, etc. */
  focusId?: string;
};

const VIEW_KEYWORDS: Record<AdminView, string[]> = {
  overview: ["dashboard", "overview"],
  analytics: ["analytics", "traffic"],
  products: ["product"],
  orders: ["order"],
  customers: ["customer", "user"],
  coupons: ["coupon", "voucher"],
  site_content: ["site", "content"],
  blog_cms: ["blog", "cms"],
};

function includesQuery(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query);
}

export function buildAdminSearchResults(
  query: string,
  data: {
    orders: DbOrder[];
    products: DbProduct[];
    users: DbUser[];
    coupons: DbCoupon[];
  },
  limit = 12,
): AdminSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: AdminSearchResult[] = [];

  for (const [view, keywords] of Object.entries(VIEW_KEYWORDS) as [
    AdminView,
    string[],
  ][]) {
    const label = ADMIN_VIEW_LABELS[view];
    if (
      includesQuery(label, q) ||
      keywords.some((kw) => kw.includes(q) || q.includes(kw))
    ) {
      results.push({
        id: `view-${view}`,
        view,
        kind: "view",
        label,
        subtitle: "Open admin page",
      });
    }
  }

  for (const order of data.orders) {
    const haystack = [
      order.id,
      order.shipping_full_name,
      order.shipping_phone,
      order.status,
    ]
      .join(" ")
      .toLowerCase();
    if (includesQuery(haystack, q)) {
      results.push({
        id: `order-${order.id}`,
        view: "orders",
        kind: "order",
        label: `Order #${order.id}`,
        subtitle: order.shipping_full_name || order.shipping_phone || undefined,
        focusId: String(order.id),
      });
    }
  }

  for (const product of data.products) {
    const haystack = [product.product_code, product.id, product.name, product.brand_tag]
      .join(" ")
      .toLowerCase();
    if (includesQuery(haystack, q)) {
      results.push({
        id: `product-${product.id}`,
        view: "products",
        kind: "product",
        label: product.name || `SP #${getProductManageCode(product)}`,
        subtitle: `Code ${getProductManageCode(product)}`,
        focusId: String(product.id),
      });
    }
  }

  for (const user of data.users) {
    const haystack = [user.id, user.email, user.role, user.full_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (includesQuery(haystack, q)) {
      results.push({
        id: `user-${user.id}`,
        view: "customers",
        kind: "user",
        label: user.email,
        subtitle: user.role === "admin" ? "Admin" : "Customer",
        focusId: user.id,
      });
    }
  }

  for (const coupon of data.coupons) {
    const haystack = [coupon.code, coupon.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (includesQuery(haystack, q)) {
      results.push({
        id: `coupon-${coupon.code}`,
        view: "coupons",
        kind: "coupon",
        label: coupon.code,
        subtitle: coupon.description || undefined,
        focusId: coupon.code,
      });
    }
  }

  return results.slice(0, limit);
}
