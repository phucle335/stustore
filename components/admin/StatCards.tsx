"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { DollarSign, Package, ShoppingBag, TrendingDown, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/components/admin/format";
import type { DashboardStats } from "@/lib/admin/stats";

type StatCardsProps = {
  stats: DashboardStats;
};

const cards = [
  {
    key: "revenue",
    label: "Doanh thu",
    icon: DollarSign,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    stroke: "#3b82f6",
    trend: "+12.5%",
    up: true,
    spark: [12, 18, 14, 22, 20, 28, 24, 32],
  },
  {
    key: "orders",
    label: "Đơn hàng",
    icon: ShoppingBag,
    iconBg: "#d1fae5",
    iconColor: "#059669",
    stroke: "#10b981",
    trend: "-3.2%",
    up: false,
    spark: [20, 18, 22, 16, 19, 15, 17, 14],
  },
  {
    key: "products",
    label: "Sản phẩm",
    icon: Package,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    stroke: "#8b5cf6",
    trend: "+5.8%",
    up: true,
    spark: [8, 10, 12, 11, 14, 16, 15, 18],
  },
  {
    key: "customers",
    label: "Khách hàng",
    icon: Users,
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
    stroke: "#f97316",
    trend: "+0.4%",
    up: true,
    spark: [10, 12, 11, 15, 14, 18, 20, 22],
  },
] as const;

export function StatCards({ stats }: StatCardsProps) {
  const values: Record<(typeof cards)[number]["key"], string> = {
    revenue: formatCurrency(stats.totalRevenue),
    orders: stats.totalOrders.toLocaleString("vi-VN"),
    products: stats.totalProducts.toLocaleString("vi-VN"),
    customers: stats.totalCustomers.toLocaleString("vi-VN"),
  };

  return (
    <div className="admin-grid-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const sparkData = card.spark.map((v, i) => ({ i, v }));
        const TrendIcon = card.up ? TrendingUp : TrendingDown;

        return (
          <article key={card.key} className="admin-card admin-stat-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm admin-muted">{card.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight admin-text">
                  {values[card.key]}
                </p>
                <span
                  className={`admin-stat-trend ${card.up ? "admin-stat-trend--up" : "admin-stat-trend--down"}`}
                >
                  <TrendIcon className="inline h-3.5 w-3.5" aria-hidden />
                  {card.trend} so với 30 ngày
                </span>
              </div>
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
            <div className="admin-stat-spark">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.stroke}
                    fill={card.stroke}
                    fillOpacity={0.15}
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        );
      })}
    </div>
  );
}
