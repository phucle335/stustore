"use server";

import { withAdminAction } from "@/lib/admin/auth";
import { buildDashboardStats } from "@/lib/admin/stats";
import { success, type ActionResult } from "@/lib/admin/result";
import type { DashboardStats } from "@/lib/admin/stats";
import * as orders from "@/lib/admin/data/orders";
import * as products from "@/lib/admin/data/products";
import * as users from "@/lib/admin/data/users";

export async function getDashboardStatsAction(): Promise<
  ActionResult<DashboardStats>
> {
  return withAdminAction(async () => {
    const [ordersResult, productsResult, usersResult] = await Promise.all([
      orders.listOrders(),
      products.listProducts(),
      users.listCustomers(),
    ]);

    if (!ordersResult.ok) return ordersResult;
    if (!productsResult.ok) return productsResult;
    if (!usersResult.ok) return usersResult;

    return success(
      buildDashboardStats(
        ordersResult.data,
        productsResult.data,
        usersResult.data,
      ),
    );
  });
}
