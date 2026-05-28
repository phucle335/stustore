"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, Plus, RefreshCw } from "lucide-react";
import { AnalyticsOverview } from "@/components/admin/analytics/AnalyticsOverview";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopBar } from "@/components/admin/layout/AdminTopBar";
import type { AdminView } from "@/components/admin/layout/admin-views";
import { ADMIN_VIEW_LABELS } from "@/components/admin/layout/admin-views";
import { CouponManager } from "@/components/admin/CouponManager";
import { CustomerManager } from "@/components/admin/CustomerManager";
import { OrderManager } from "@/components/admin/OrderManager";
import { ProductManager } from "@/components/admin/ProductManager";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatCards } from "@/components/admin/StatCards";
import type { DashboardStats } from "@/lib/admin/stats";
import type {
  DbCoupon,
  DbOrder,
  DbProduct,
  DbSupportRequest,
  DbUser,
  AdminAuditLog,
  DbNotification,
} from "@/lib/supabase/types";
import { SiteContentManager } from "@/components/admin/SiteContentManager";
import { BlogPostManager } from "@/components/admin/BlogPostManager";
import { OrdersTablePreview } from "@/components/admin/OrdersTablePreview";
import { AdminAuditNotificationsTabs } from "@/components/admin/AdminAuditNotificationsTabs";

type AdminDashboardClientProps = {
  stats: DashboardStats;
  products: DbProduct[];
  orders: DbOrder[];
  users: DbUser[];
  coupons: DbCoupon[];
  supportRequests: DbSupportRequest[];
  auditLogs: AdminAuditLog[];
  notifications: DbNotification[];
  initialView?: AdminView;
};

export function AdminDashboardClient({
  stats,
  products,
  orders,
  users,
  coupons,
  supportRequests,
  auditLogs,
  notifications,
  initialView: initialViewProp,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const allowedViews: AdminView[] = [
    "overview",
    "analytics",
    "products",
    "orders",
    "customers",
    "coupons",
    "site_content",
    "blog_cms",
  ];

  const routeView = (() => {
    const seg = pathname.split("/").filter(Boolean)[1] || "";
    return allowedViews.includes(seg as AdminView) ? (seg as AdminView) : null;
  })();

  const urlView: AdminView | null =
    viewParam && allowedViews.includes(viewParam as AdminView)
      ? (viewParam as AdminView)
      : null;

  const initialView: AdminView =
    urlView ?? routeView ?? initialViewProp ?? "overview";

  const [view, setView] = useState<AdminView>(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const customers = users.filter((user) => user.role === "user");

  function handleViewChange(next: AdminView) {
    setView(next);
    setMobileSidebarOpen(false);
    router.push(next === "overview" ? "/admin" : `/admin/${next}`);
  }

  useEffect(() => {
    const next = urlView ?? routeView ?? initialViewProp ?? "overview";
    if (next !== view) setView(next);
  }, [urlView, routeView, initialViewProp, view]);

  const subtitle =
    view === "overview"
      ? "Chào mừng trở lại — tổng quan hoạt động cửa hàng Stusport hôm nay."
      : `Quản lý ${ADMIN_VIEW_LABELS[view].toLowerCase()} — dữ liệu thời gian thực từ Supabase.`;

  return (
    <div className="admin-app">
      <button
        type="button"
        className={`admin-sidebar-backdrop${mobileSidebarOpen ? " is-visible" : ""}`}
        aria-label="Đóng menu"
        aria-hidden={!mobileSidebarOpen}
        tabIndex={mobileSidebarOpen ? 0 : -1}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <AdminSidebar
        activeView={view}
        onViewChange={handleViewChange}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        counts={{
          products: products.length,
          orders: orders.length,
          customers: customers.length,
          coupons: coupons.length,
        }}
      />

      <div className="admin-main">
        <AdminTopBar
          notifications={notifications}
          onMenuClick={() => {
            if (window.innerWidth < 900) {
              setMobileSidebarOpen((open) => !open);
            } else {
              setSidebarCollapsed((c) => !c);
            }
          }}
        />

        <div className="admin-content">
          <div className="admin-page-head admin-card">
            <div>
              <h1>{ADMIN_VIEW_LABELS[view]}</h1>
              <p>{subtitle}</p>
            </div>
            {view === "overview" ? (
              <div className="admin-toolbar">
                <button type="button" className="admin-btn">
                  30 ngày qua
                </button>
                <button type="button" className="admin-btn">
                  <RefreshCw className="h-4 w-4" />
                  Làm mới
                </button>
                <button type="button" className="admin-btn">
                  <Download className="h-4 w-4" />
                  Xuất
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => handleViewChange("products")}
                >
                  <Plus className="h-4 w-4" />
                  Thêm sản phẩm
                </button>
              </div>
            ) : null}
          </div>

          {view === "overview" ? (
            <div className="space-y-6">
              <StatCards stats={stats} />
              <div className="admin-grid-2">
                <OrdersTablePreview orders={orders} users={users} />
                <div className="space-y-6">
                  <RevenueChart data={stats.revenueByMonth} />
                  <AdminAuditNotificationsTabs
                    auditLogs={auditLogs}
                    notifications={notifications}
                    users={users}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {view === "analytics" ? <AnalyticsOverview /> : null}
          {view === "products" ? (
            <ProductManager initialProducts={products} />
          ) : null}
          {view === "orders" ? (
            <OrderManager
              initialOrders={orders}
              customers={users}
              products={products}
              auditLogs={auditLogs}
            />
          ) : null}
          {view === "customers" ? (
            <CustomerManager
              initialUsers={users}
              supportRequests={supportRequests}
            />
          ) : null}
          {view === "coupons" ? (
            <CouponManager initialCoupons={coupons} />
          ) : null}
          {view === "site_content" ? <SiteContentManager /> : null}
          {view === "blog_cms" ? <BlogPostManager /> : null}

        </div>
      </div>
    </div>
  );
}
