"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Store } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

type AdminTopBarProps = {
  onMenuClick: () => void;
};

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-icon-btn"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <label className="admin-topbar-search">
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <input type="search" placeholder="Tìm kiếm…" aria-label="Tìm kiếm" />
      </label>

      <div className="admin-topbar-actions">
        <button type="button" className="admin-icon-btn" aria-label="Thông báo">
          <Bell className="h-4 w-4" />
        </button>
        <Link href="/" className="admin-icon-btn" aria-label="Cửa hàng">
          <Store className="h-4 w-4" />
        </Link>
        <button
          type="button"
          className="admin-icon-btn"
          onClick={() => void handleSignOut()}
          aria-label="Đăng xuất"
        >
          <LogOut className="h-4 w-4" />
        </button>
        <div className="admin-user-pill">
          <span className="admin-user-avatar">AD</span>
          <span className="hidden sm:inline">Admin</span>
        </div>
      </div>
    </header>
  );
}
