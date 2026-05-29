"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StusportLogo } from "@/components/brand/StusportLogo";
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
        <div className="admin-header-brand">
          <StusportLogo variant="mark" href="/admin" className="stusport-logo--compact" />
          <span className="admin-header-brand__suffix">Admin</span>
        </div>
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
