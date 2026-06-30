"use client";

import Link from "next/link";
import { StusportLogo } from "@/components/brand/StusportLogo";
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
  href: string;
}[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    id: "analytics",
    label: "Featured Highlights",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    countKey: "products",
    href: "/admin/products",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    countKey: "orders",
    href: "/admin/orders",
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    countKey: "customers",
    href: "/admin/customers",
  },
  {
    id: "coupons",
    label: "Coupons",
    icon: Tag,
    countKey: "coupons",
    href: "/admin/coupons",
  },
  { id: "site_content", label: "Site Content", icon: Globe, href: "/admin/site_content" },
  { id: "blog_cms", label: "Blog CMS", icon: FileText, href: "/admin/blog_cms" },
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
        <StusportLogo variant="mark" href="/admin" />
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : null;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`admin-nav-item${activeView === item.id ? " is-active" : ""}`}
              onClick={() => onViewChange(item.id)}
              title={item.label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed ? <span>{item.label}</span> : null}
              {!collapsed && count != null ? (
                <span className="admin-nav-badge">{count}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
