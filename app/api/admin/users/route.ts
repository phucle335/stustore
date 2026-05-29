import { NextRequest } from "next/server";
import { jsonResult, withAdminApi } from "@/lib/admin/api";
import * as users from "@/lib/admin/data/users";
import type { UserRole } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role") as UserRole | null;
  if (role && role !== "user" && role !== "admin") {
    return jsonResult({ ok: false, error: "role must be 'user' or 'admin'" });
  }
  return withAdminApi(() => users.listUsersByRole(role ?? undefined));
}
