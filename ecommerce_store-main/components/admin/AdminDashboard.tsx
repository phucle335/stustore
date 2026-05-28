import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import type { DashboardStats } from "@/lib/admin/stats";
import type {
  DbCoupon,
  DbOrder,
  DbProduct,
  DbNotification,
  DbSupportRequest,
  AdminAuditLog,
  DbUser,
} from "@/lib/supabase/types";

type AdminDashboardProps = {
  stats: DashboardStats;
  products: DbProduct[];
  orders: DbOrder[];
  users: DbUser[];
  coupons: DbCoupon[];
  supportRequests: DbSupportRequest[];
  auditLogs: AdminAuditLog[];
  notifications: DbNotification[];
};

export function AdminDashboard({
  stats,
  products,
  orders,
  users,
  coupons,
  supportRequests,
  auditLogs,
  notifications,
}: AdminDashboardProps) {
  return (
    <AdminDashboardClient
      stats={stats}
      products={products}
      orders={orders}
      users={users}
      coupons={coupons}
      supportRequests={supportRequests}
      auditLogs={auditLogs}
      notifications={notifications}
    />
  );
}
