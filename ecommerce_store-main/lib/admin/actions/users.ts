"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin, withAdminAction } from "@/lib/admin/auth";
import * as users from "@/lib/admin/data/users";
import type { UpdateUserInput, UserRole } from "@/lib/supabase/types";
import { logAdminAuditAndNotification } from "@/lib/admin/audit/log";

const ADMIN_PATH = "/admin";

function revalidateUsers() {
  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/customers`);
}

export async function getCustomersAction() {
  return withAdminAction(() => users.listCustomers());
}

export async function getUserAction(id: string) {
  return withAdminAction(() => users.getUser(id));
}

export async function updateUserAction(id: string, input: UpdateUserInput) {
  return withAdminAction(async () => {
    const result = await users.updateUser(id, input);
    if (result.ok) {
      revalidateUsers();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "user_updated",
            entityType: "user",
            entityId: id,
            diff: { input },
          },
          {
            type: "admin_action",
            title: "Admin cập nhật khách hàng",
            body: `Cập nhật user ${id}`,
            entityType: "user",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function assignRoleAction(id: string, role: UserRole) {
  return withAdminAction(async () => {
    const result = await users.assignUserRole(id, role);
    if (result.ok) {
      revalidateUsers();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "user_role_assigned",
            entityType: "user",
            entityId: id,
            diff: { role },
          },
          {
            type: "admin_action",
            title: "Admin cập nhật role khách hàng",
            body: `User ${id} → ${role}`,
            entityType: "user",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}

export async function deleteUserAction(id: string) {
  return withAdminAction(async () => {
    const result = await users.deleteUser(id);
    if (result.ok) {
      revalidateUsers();
      const auth = await guardAdmin();
      if (auth.ok) {
        await logAdminAuditAndNotification(
          {
            adminUserId: auth.data.userId,
            action: "user_deleted",
            entityType: "user",
            entityId: id,
            diff: { id },
          },
          {
            type: "admin_action",
            title: "Admin xóa khách hàng",
            body: `Xóa user ${id}`,
            entityType: "user",
            entityId: id,
          },
        );
      }
    }
    return result;
  });
}
