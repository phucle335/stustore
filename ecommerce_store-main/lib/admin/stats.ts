import type { DbOrder, DbProduct, DbUser } from "@/lib/supabase/types";

export type RevenueMonth = {
  key: string;
  label: string;
  revenue: number;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueByMonth: RevenueMonth[];
};

function lastSixMonthBuckets(): Omit<RevenueMonth, "revenue">[] {
  const buckets: Omit<RevenueMonth, "revenue">[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("vi-VN", {
      month: "short",
      year: "2-digit",
    });
    buckets.push({ key, label });
  }

  return buckets;
}

export function buildDashboardStats(
  orders: DbOrder[],
  products: DbProduct[],
  users: DbUser[],
): DashboardStats {
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const totalRevenue = activeOrders.reduce(
    (sum, order) => sum + order.total_price,
    0,
  );

  const buckets = lastSixMonthBuckets();
  const revenueMap = new Map(buckets.map((bucket) => [bucket.key, 0]));

  for (const order of activeOrders) {
    const date = new Date(order.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (revenueMap.has(key)) {
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + order.total_price);
    }
  }

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: users.filter((user) => user.role === "user").length,
    revenueByMonth: buckets.map((bucket) => ({
      ...bucket,
      revenue: revenueMap.get(bucket.key) ?? 0,
    })),
  };
}
