"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Store } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

export function AdminHeader() {
  const router = useRouter();

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="admin-page-head admin-card mb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#6b7a99]">
          Stusport Admin
        </p>
        <h1>Admin Dashboard</h1>
        <p>Quản lý sản phẩm giày, đơn hàng và tồn kho theo size</p>
      </div>

      <div className="admin-toolbar">
        <Link href="/" className="admin-btn">
          <Store className="h-4 w-4" />
          Cửa hàng
        </Link>
        <button type="button" onClick={handleSignOut} className="admin-btn admin-btn--primary">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
