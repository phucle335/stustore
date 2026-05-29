import type { DbOrder, DbProduct, DbUser } from "@/lib/supabase/types";

export type RevenueMonth = {
  key: string;
  label: string;
  revenue: number;
};

export type StatTrend = {
  value: string;
  up: boolean;
};

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueByMonth: RevenueMonth[];
  trends: {
    revenue: StatTrend;
    orders: StatTrend;
    products: StatTrend;
    customers: StatTrend;
  };
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

function pctChange(current: number, previous: number): StatTrend {
  if (previous <= 0 && current <= 0) {
    return { value: "0%", up: true };
  }
  if (previous <= 0) {
    return { value: "+100%", up: true };
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  const sign = up ? "+" : "";
  return {
    value: `${sign}${pct.toFixed(1)}%`,
    up,
  };
}

function inRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
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

  const now = new Date();
  const curStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const ordersCur = orders.filter((o) =>
    inRange(o.created_at, curStart, now),
  );
  const ordersPrev = orders.filter((o) =>
    inRange(o.created_at, prevStart, curStart),
  );

  const revenueCur = ordersCur
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total_price, 0);
  const revenuePrev = ordersPrev
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total_price, 0);

  const productsCur = products.filter((p) => inRange(p.created_at, curStart, now)).length;
  const productsPrev = products.filter((p) =>
    inRange(p.created_at, prevStart, curStart),
  ).length;

  const customers = users.filter((u) => u.role === "user");
  const customersCur = customers.filter((u) =>
    inRange(u.created_at, curStart, now),
  ).length;
  const customersPrev = customers.filter((u) =>
    inRange(u.created_at, prevStart, curStart),
  ).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
    revenueByMonth: buckets.map((bucket) => ({
      ...bucket,
      revenue: revenueMap.get(bucket.key) ?? 0,
    })),
    trends: {
      revenue: pctChange(revenueCur, revenuePrev),
      orders: pctChange(ordersCur.length, ordersPrev.length),
      products: pctChange(productsCur, productsPrev),
      customers: pctChange(customersCur, customersPrev),
    },
  };
}
