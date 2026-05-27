import Link from "next/link";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

import { getDashboardStatsAction } from "@/lib/admin/actions/dashboard";
import { getOrdersAction } from "@/lib/admin/actions/orders";
import { getProductsAction } from "@/lib/admin/actions/products";
import { getCouponsAction } from "@/lib/admin/actions/coupons";
import { getCustomersAction } from "@/lib/admin/actions/users";

export default async function AdminPage() {
  const [statsResult, productsResult, ordersResult, usersResult, couponsResult] =
    await Promise.all([
      getDashboardStatsAction(),
      getProductsAction(),
      getOrdersAction(),
      getCustomersAction(),
      getCouponsAction(),
    ]);

  if (
    !statsResult.ok ||
    !productsResult.ok ||
    !ordersResult.ok ||
    !usersResult.ok ||
    !couponsResult.ok
  ) {
    const error = !statsResult.ok
      ? statsResult.error
      : !productsResult.ok
        ? productsResult.error
        : !ordersResult.ok
          ? ordersResult.error
          : !usersResult.ok
            ? usersResult.error
            : !couponsResult.ok
              ? couponsResult.error
              : "Unknown error";

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-xl font-semibold text-white">
            Không truy cập được Admin
          </h1>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Link
            href="/login?redirect=/admin"
            className="mt-6 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      stats={statsResult.data}
      products={productsResult.data}
      orders={ordersResult.data}
      users={usersResult.data}
      coupons={couponsResult.data}
    />
  );
}
