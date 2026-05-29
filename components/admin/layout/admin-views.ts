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
  analytics: "Tổng quan nổi bật",
  products: "Sản phẩm",
  orders: "Đơn hàng",
  customers: "Khách hàng",
  coupons: "Phiếu giảm giá",
  site_content: "Site Content",
  blog_cms: "CMS Blog",
};
