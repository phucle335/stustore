"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Store } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { DbNotification } from "@/lib/supabase/types";

type AdminTopBarProps = {
  onMenuClick: () => void;
  notifications?: DbNotification[];
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminTopBar({
  onMenuClick,
  notifications = [],
}: AdminTopBarProps) {
  const router = useRouter();
  const [openNotif, setOpenNotif] = useState(false);

  const adminNotifs = useMemo(
    () => notifications.filter((n) => n.type === "admin_action").slice(0, 6),
    [notifications],
  );
  const customerNotifs = useMemo(
    () => notifications.filter((n) => n.type !== "admin_action").slice(0, 6),
    [notifications],
  );

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
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Thông báo"
          onClick={() => setOpenNotif((v) => !v)}
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 ? (
            <span className="admin-notif-badge">{notifications.length}</span>
          ) : null}
        </button>
        {openNotif ? (
          <div className="admin-notif-panel">
            <p className="admin-notif-head">Thông báo Admin</p>
            {adminNotifs.length === 0 ? (
              <p className="admin-notif-empty">Chưa có thông báo admin.</p>
            ) : (
              adminNotifs.map((n) => (
                <div key={n.id} className="admin-notif-item">
                  <p className="admin-notif-title">{n.title}</p>
                  {n.body ? <p className="admin-notif-body">{n.body}</p> : null}
                  <p className="admin-notif-time">{formatTime(n.created_at)}</p>
                </div>
              ))
            )}

            <p className="admin-notif-head" style={{ marginTop: 10 }}>
              KH hỗ trợ / Đơn hàng
            </p>
            {customerNotifs.length === 0 ? (
              <p className="admin-notif-empty">Chưa có thông báo khách hàng/đơn.</p>
            ) : (
              customerNotifs.map((n) => (
                <div key={n.id} className="admin-notif-item">
                  <p className="admin-notif-title">{n.title}</p>
                  {n.body ? <p className="admin-notif-body">{n.body}</p> : null}
                  <p className="admin-notif-time">{formatTime(n.created_at)}</p>
                </div>
              ))
            )}
          </div>
        ) : null}
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
        <Link href="/tai-khoan" className="admin-user-pill" aria-label="Hồ sơ cá nhân">
          <span className="admin-user-avatar">AD</span>
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}
