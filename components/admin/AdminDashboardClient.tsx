"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildAdminSearchResults,
  type AdminSearchResult,
} from "@/lib/admin/admin-search";
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
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [focusOrderId, setFocusOrderId] = useState<string | null>(
    () => searchParams.get("order") ?? null,
  );

  const customers = users.filter((user) => user.role === "user");

  const searchResults = useMemo(
    () =>
      buildAdminSearchResults(searchQuery, {
        orders,
        products,
        users,
        coupons,
      }),
    [searchQuery, orders, products, users, coupons],
  );

  function handleViewChange(next: AdminView) {
    setView(next);
    setMobileSidebarOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (next === "orders" && focusOrderId) params.set("order", focusOrderId);
    const qs = params.toString();
    router.push(
      next === "overview" ? `/admin${qs ? `?${qs}` : ""}` : `/admin/${next}${qs ? `?${qs}` : ""}`,
    );
  }

  const handleSelectSearchResult = useCallback(
    (result: AdminSearchResult) => {
      setSearchQuery(result.kind === "view" ? "" : searchQuery);
      if (result.kind === "order" && result.focusId) {
        setFocusOrderId(result.focusId);
      } else {
        setFocusOrderId(null);
      }
      setView(result.view);
      setMobileSidebarOpen(false);
      const params = new URLSearchParams();
      if (result.kind !== "view" && searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }
      if (result.kind === "order" && result.focusId) {
        params.set("order", result.focusId);
      }
      const qs = params.toString();
      router.push(
        result.view === "overview"
          ? `/admin${qs ? `?${qs}` : ""}`
          : `/admin/${result.view}${qs ? `?${qs}` : ""}`,
      );
    },
    [router, searchQuery],
  );

  useEffect(() => {
    const next = urlView ?? routeView ?? initialViewProp ?? "overview";
    if (next !== view) setView(next);
  }, [urlView, routeView, initialViewProp, view]);

  const subtitle =
    view === "overview"
      ? "Welcome back — Stusport store activity overview for today."
      : `Manage ${ADMIN_VIEW_LABELS[view]} — real-time data from Supabase.`;

  return (
    <div className="admin-app">
      <button
        type="button"
        className={`admin-sidebar-backdrop${mobileSidebarOpen ? " is-visible" : ""}`}
        aria-label="Close menu"
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
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
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
                  Last 30 days
                </button>
                <button type="button" className="admin-btn">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button type="button" className="admin-btn">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={() => handleViewChange("products")}
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </div>
            ) : null}
          </div>

          {view === "overview" ? (
            <div className="admin-stack">
              <StatCards stats={stats} />
              <div className="admin-grid-2">
                <OrdersTablePreview
                  orders={orders}
                  users={users}
                  filterQuery={searchQuery}
                />
                <div className="admin-stack">
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
            <ProductManager
              initialProducts={products}
              filterQuery={searchQuery}
            />
          ) : null}
          {view === "orders" ? (
            <OrderManager
              initialOrders={orders}
              customers={users}
              products={products}
              auditLogs={auditLogs}
              filterQuery={searchQuery}
              focusOrderId={focusOrderId}
              onFocusOrderHandled={() => setFocusOrderId(null)}
            />
          ) : null}
          {view === "customers" ? (
            <CustomerManager
              initialUsers={users}
              supportRequests={supportRequests}
              filterQuery={searchQuery}
            />
          ) : null}
          {view === "coupons" ? (
            <CouponManager
              initialCoupons={coupons}
              filterQuery={searchQuery}
            />
          ) : null}
          {view === "site_content" ? <SiteContentManager /> : null}
          {view === "blog_cms" ? <BlogPostManager /> : null}

        </div>
      </div>
    </div>
  );
}
