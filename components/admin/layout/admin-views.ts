export type AdminView =
  | "overview"
  | "analytics"
  | "products"
  | "orders"
  | "customers"
  | "coupons"
  | "site_content"
  | "blog_cms";

export const ADMIN_VIEW_LABELS: Record<AdminView, string> = {
  overview: "Dashboard",
  analytics: "Featured Highlights",
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  coupons: "Coupons",
  site_content: "Site Content",
  blog_cms: "Blog CMS",
};
