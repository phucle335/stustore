"use client";

import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Globe,
  FileText,
} from "lucide-react";
import type { AdminView } from "./admin-views";

type AdminSidebarProps = {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  counts: {
    products: number;
    orders: number;
    customers: number;
    coupons: number;
  };
};

const navItems: {
  id: AdminView;
  label: string;
  icon: typeof LayoutDashboard;
  countKey?: keyof AdminSidebarProps["counts"];
}[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "analytics", label: "Tổng quan nổi bật", icon: BarChart3 },
  { id: "products", label: "Sản phẩm", icon: Package, countKey: "products" },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag, countKey: "orders" },
  {
    id: "customers",
    label: "Khách hàng",
    icon: Users,
    countKey: "customers",
  },
  { id: "coupons", label: "Phiếu giảm giá", icon: Tag, countKey: "coupons" },
  { id: "site_content", label: "Nội dung site", icon: Globe },
  { id: "blog_cms", label: "CMS Blog", icon: FileText },
];

export function AdminSidebar({
  activeView,
  onViewChange,
  collapsed,
  mobileOpen,
  counts,
}: AdminSidebarProps) {
  return (
    <aside
      className={`admin-sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-open" : ""}`}
      aria-label="Admin navigation"
    >
      <div className="admin-sidebar-brand">
        <strong>
          {!collapsed ? (
            <>
              Stu<span>sport</span>
            </>
          ) : (
            "S"
          )}
        </strong>
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : null;
          return (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item${activeView === item.id ? " is-active" : ""}`}
              onClick={() => onViewChange(item.id)}
              title={item.label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed ? <span>{item.label}</span> : null}
              {!collapsed && count != null ? (
                <span className="admin-nav-badge">{count}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        {!collapsed ? (
          <p className="text-xs" style={{ color: "#64748b", padding: "0 8px" }}>
            Stusport Admin · 2026
          </p>
        ) : null}
      </div>
    </aside>
  );
}
