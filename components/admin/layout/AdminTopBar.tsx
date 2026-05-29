"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Store } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AdminSearchResult } from "@/lib/admin/admin-search";
import type { DbNotification } from "@/lib/supabase/types";

type AdminTopBarProps = {
  onMenuClick: () => void;
  notifications?: DbNotification[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: AdminSearchResult[];
  onSelectSearchResult: (result: AdminSearchResult) => void;
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
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectSearchResult,
}: AdminTopBarProps) {
  const router = useRouter();
  const [openNotif, setOpenNotif] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const adminNotifs = useMemo(
    () => notifications.filter((n) => n.type === "admin_action").slice(0, 6),
    [notifications],
  );
  const customerNotifs = useMemo(
    () => notifications.filter((n) => n.type !== "admin_action").slice(0, 6),
    [notifications],
  );

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSearchOpen(false);
      return;
    }
    if (event.key === "Enter" && searchResults.length > 0) {
      event.preventDefault();
      onSelectSearchResult(searchResults[0]);
      setSearchOpen(false);
    }
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

      <div className="admin-topbar-search-wrap" ref={searchWrapRef}>
        <label className="admin-topbar-search">
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <input
            type="search"
            placeholder="Tìm kiếm…"
            aria-label="Tìm kiếm admin"
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
        </label>

        {searchOpen && searchQuery.trim() ? (
          <div className="admin-search-dropdown" role="listbox">
            {searchResults.length === 0 ? (
              <p className="admin-search-dropdown__empty">Không tìm thấy kết quả</p>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="admin-search-dropdown__item"
                  role="option"
                  onClick={() => {
                    onSelectSearchResult(result);
                    setSearchOpen(false);
                  }}
                >
                  <span className="admin-search-dropdown__label">{result.label}</span>
                  {result.subtitle ? (
                    <span className="admin-search-dropdown__sub">{result.subtitle}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="admin-topbar-actions">
        <button
          type="button"
          className={`admin-icon-btn${notifications.length > 0 ? " admin-icon-btn--has-badge" : ""}`}
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
          <span className="admin-user-pill__name">Admin</span>
        </Link>
      </div>
    </header>
  );
}
