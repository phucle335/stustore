"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin, withAdminAction } from "@/lib/admin/auth";
import * as orders from "@/lib/admin/data/orders";
import * as users from "@/lib/admin/data/users";
import { parseOrdersCsv } from "@/lib/admin/parse-orders-import";
import { failure } from "@/lib/admin/result";
import type { CreateOrderInput, UpdateOrderInput } from "@/lib/supabase/types";
import { logAdminAuditAndNotification } from "@/lib/admin/audit/log";

const ADMIN_PATH = "/admin";

function revalidateOrders() {
  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/orders`);
}

export async function getOrdersAction() {
  return withAdminAction(() => orders.listOrders());
}

export async function getOrderAction(id: string) {
  return withAdminAction(() => orders.getOrder(id));
}

export async function createOrderAction(input: CreateOrderInput) {
  return withAdminAction(async () => {
    const result = await orders.createOrder(input);
    if (result.ok) {
      revalidateOrders();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "order_created",
            entityType: "order",
            entityId: result.data.id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin tạo đơn hàng",
            body: `Tạo đơn ${result.data.id}`,
            entityType: "order",
            entityId: result.data.id,
          },
        );
      }
    }
    return result;
  });
}

export async function updateOrderAction(id: string, input: UpdateOrderInput) {
  return withAdminAction(async () => {
    const result = await orders.updateOrder(id, input);
    if (result.ok) {
      revalidateOrders();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "order_updated",
            entityType: "order",
            entityId: id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin cập nhật đơn hàng",
            body: `Cập nhật đơn ${id}`,
            entityType: "order",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function deleteOrderAction(id: string) {
  return withAdminAction(async () => {
    const result = await orders.deleteOrder(id);
    if (result.ok) {
      revalidateOrders();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "order_deleted",
            entityType: "order",
            entityId: id,
            diff: { id },
          },
          {
            type: "admin_action",
            title: "Admin xóa đơn hàng",
            body: `Xóa đơn ${id}`,
            entityType: "order",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function importOrdersAction(csvText: string) {
  return withAdminAction(async () => {
    const usersResult = await users.listCustomers();
    if (!usersResult.ok) return usersResult;

    const emailToUserId = new Map<string, string>();
    for (const user of usersResult.data) {
      emailToUserId.set(user.email.toLowerCase(), user.id);
    }

    const parsed = parseOrdersCsv(csvText, emailToUserId);
    if (!parsed.ok) {
      return failure(parsed.errors.join("\n"));
    }

    const inputs = parsed.rows.map(
      ({ email: _email, rowNumber: _row, ...order }) => order,
    );
    const result = await orders.createOrdersBulk(inputs);
    if (!result.ok) return result;

    revalidateOrders();
    return {
      ok: true as const,
      data: { count: result.data.length, orders: result.data },
    };
  });
}
