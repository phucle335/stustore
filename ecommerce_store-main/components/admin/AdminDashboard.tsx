import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import type { DashboardStats } from "@/lib/admin/stats";
import type { DbCoupon, DbOrder, DbProduct, DbUser } from "@/lib/supabase/types";

type AdminDashboardProps = {
  stats: DashboardStats;
  products: DbProduct[];
  orders: DbOrder[];
  users: DbUser[];
  coupons: DbCoupon[];
};

export function AdminDashboard({
  stats,
  products,
  orders,
  users,
  coupons,
}: AdminDashboardProps) {
  return (
    <AdminDashboardClient
      stats={stats}
      products={products}
      orders={orders}
      users={users}
      coupons={coupons}
    />
  );
}
