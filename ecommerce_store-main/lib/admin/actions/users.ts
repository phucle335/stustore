"use server";

import { revalidatePath } from "next/cache";
import { withAdminAction } from "@/lib/admin/auth";
import * as users from "@/lib/admin/data/users";
import type { UpdateUserInput, UserRole } from "@/lib/supabase/types";

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
    if (result.ok) revalidateUsers();
    return result;
  });
}

export async function assignRoleAction(id: string, role: UserRole) {
  return withAdminAction(async () => {
    const result = await users.assignUserRole(id, role);
    if (result.ok) revalidateUsers();
    return result;
  });
}

export async function deleteUserAction(id: string) {
  return withAdminAction(async () => {
    const result = await users.deleteUser(id);
    if (result.ok) revalidateUsers();
    return result;
  });
}
