"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Shield, ShieldOff, Trash2 } from "lucide-react";
import {
  assignRoleAction,
  deleteUserAction,
} from "@/lib/admin/actions/users";
import { resolveSupportRequestAction } from "@/lib/admin/actions/support-requests";
import type { DbUser, UserRole } from "@/lib/supabase/types";
import type { DbSupportRequest } from "@/lib/supabase/types";

type CustomerManagerProps = {
  initialUsers: DbUser[];
  supportRequests: DbSupportRequest[];
  filterQuery?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CustomerManager({
  initialUsers,
  supportRequests: initialSupportRequests,
  filterQuery = "",
}: CustomerManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [supportRequests, setSupportRequests] = useState(
    initialSupportRequests ?? [],
  );
  const q = filterQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!q) return users;
    return users.filter((user) =>
      [user.email, user.full_name, user.id, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [users, q]);

  const recentSupportRequests = useMemo(() => {
    const sorted = [...supportRequests].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
    if (!q) return sorted;
    return sorted.filter((req) =>
      [req.name, req.email, req.phone, req.message, req.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [supportRequests, q]);
  const [resolvingRequestId, setResolvingRequestId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [supportPage, setSupportPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const SUPPORT_PAGE_SIZE = 8;
  const USER_PAGE_SIZE = 10;
  const supportTotalPages = Math.max(
    1,
    Math.ceil(recentSupportRequests.length / SUPPORT_PAGE_SIZE),
  );
  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USER_PAGE_SIZE));
  const pagedSupportRequests = useMemo(
    () =>
      recentSupportRequests.slice(
        (supportPage - 1) * SUPPORT_PAGE_SIZE,
        supportPage * SUPPORT_PAGE_SIZE,
      ),
    [recentSupportRequests, supportPage],
  );
  const pagedUsers = useMemo(
    () =>
      filteredUsers.slice(
        (userPage - 1) * USER_PAGE_SIZE,
        userPage * USER_PAGE_SIZE,
      ),
    [filteredUsers, userPage],
  );

  useEffect(() => {
    if (supportPage > supportTotalPages) {
      setSupportPage(supportTotalPages);
    }
  }, [supportPage, supportTotalPages]);

  useEffect(() => {
    if (userPage > userTotalPages) {
      setUserPage(userTotalPages);
    }
  }, [userPage, userTotalPages]);

  useEffect(() => {
    setSupportPage(1);
    setUserPage(1);
  }, [q]);

  function setRole(userId: string, role: UserRole) {
    startTransition(async () => {
      setPendingId(userId);
      setError(null);
      setMessage(null);

      const result = await assignRoleAction(userId, role);
      setPendingId(null);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? result.data : user)),
      );
      setMessage(
        role === "admin"
          ? "Đã gán quyền admin."
          : "Đã chuyển về khách hàng.",
      );
    });
  }

  function handleDelete(user: DbUser) {
    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) return;

    startTransition(async () => {
      setPendingId(user.id);
      setError(null);
      setMessage(null);

      const result = await deleteUserAction(user.id);
      setPendingId(null);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setUsers((current) => current.filter((item) => item.id !== user.id));
      setMessage("Đã xóa tài khoản.");
    });
  }

  function formatPhone(phone: string) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) return phone;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  function resolveRequest(id: string) {
    if (!id) return;
    if (resolvingRequestId) return;

    startTransition(async () => {
      setResolvingRequestId(id);
      setError(null);
      setMessage(null);

      const result = await resolveSupportRequestAction(id);
      if (!result.ok) {
        setError(result.error);
        setResolvingRequestId(null);
        return;
      }

      setSupportRequests((current) =>
        current.map((r) =>
          r.id === id ? { ...r, status: "resolved" } : r,
        ),
      );
      setMessage("Đã đánh dấu yêu cầu hỗ trợ là đã xử lý.");
      setResolvingRequestId(null);
    });
  }

  return (
    <section className="admin-panel">
      <div style={{ marginBottom: 20 }}>
        <h2 className="admin-card-title" style={{ margin: 0 }}>
          Khách hàng & phân quyền
        </h2>
        <p className="admin-card-sub">
          Gán role admin hoặc user cho từng tài khoản
        </p>
      </div>

      <div className="admin-stack" style={{ marginBottom: 24 }}>
        <div>
        <h3 className="admin-card-title" style={{ fontSize: "1rem" }}>
          Khách hàng cần hỗ trợ
        </h3>
        <p className="admin-card-sub">
          Yêu cầu mới gửi từ footer Contact (Zalo/Email)
        </p>

        <div className="admin-table-wrap admin-only-desktop" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead className="admin-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Khách</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Nội dung</th>
                <th className="px-4 py-3 font-medium text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSupportRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center admin-muted"
                  >
                    Chưa có yêu cầu mới
                  </td>
                </tr>
              ) : (
                pagedSupportRequests.map((req) => {
                  const digits = req.phone.replace(/\D/g, "");
                  const zaloUrl =
                    digits.length > 0 ? `https://zalo.me/${digits}` : null;
                  const resolving = resolvingRequestId === req.id;
                  return (
                    <tr key={req.id}>
                      <td className="px-4 py-3 font-medium admin-text">
                        {req.name}
                      </td>
                      <td className="px-4 py-3 admin-muted">
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {zaloUrl ? (
                            <a
                              href={zaloUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#f24e35", textDecoration: "none" }}
                            >
                              Zalo: {formatPhone(req.phone)}
                            </a>
                          ) : (
                            <span>Zalo: —</span>
                          )}
                          <a
                            href={`mailto:${req.email}`}
                            style={{
                              color: "#f24e35",
                              textDecoration: "none",
                            }}
                          >
                            Email: {req.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 admin-muted" style={{ maxWidth: 380 }}>
                        {String(req.message ?? "").slice(0, 90)}
                        {String(req.message ?? "").length > 90 ? "…" : ""}
                        <div style={{ marginTop: 8 }}>
                          <span
                            className={
                              req.status === "open"
                                ? "admin-status-chip admin-status-chip--sky"
                                : "admin-status-chip admin-status-chip--emerald"
                            }
                          >
                            {req.status === "open" ? "Mới" : "Đã xử lý"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="admin-support-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn--primary admin-btn--sm"
                            disabled={resolving || req.status === "resolved"}
                            onClick={() => resolveRequest(req.id)}
                          >
                            {req.status === "resolved"
                              ? "Đã xử lý"
                              : resolving
                                ? "Đang xử lý…"
                                : "Đánh dấu đã xử lý"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-order-mobile-list admin-only-mobile" style={{ marginTop: 12 }}>
          {recentSupportRequests.length === 0 ? (
            <p className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
              Chưa có yêu cầu mới
            </p>
          ) : (
            pagedSupportRequests.map((req) => {
              const digits = req.phone.replace(/\D/g, "");
              const zaloUrl =
                digits.length > 0 ? `https://zalo.me/${digits}` : null;
              const resolving = resolvingRequestId === req.id;
              return (
                <article key={req.id} className="admin-mobile-card" style={{ cursor: "default" }}>
                  <div className="admin-mobile-card__head">
                    <p className="admin-mobile-card__id">{req.name}</p>
                    <span
                      className={
                        req.status === "open"
                          ? "admin-status-chip admin-status-chip--sky"
                          : "admin-status-chip admin-status-chip--emerald"
                      }
                    >
                      {req.status === "open" ? "Mới" : "Đã xử lý"}
                    </span>
                  </div>
                  <div className="admin-mobile-card__body">
                    {zaloUrl ? (
                      <p>
                        <a href={zaloUrl} target="_blank" rel="noreferrer" className="admin-link">
                          Zalo: {formatPhone(req.phone)}
                        </a>
                      </p>
                    ) : (
                      <p>Zalo: —</p>
                    )}
                    <p>
                      <a href={`mailto:${req.email}`} className="admin-link">
                        {req.email}
                      </a>
                    </p>
                    <p>{String(req.message ?? "").slice(0, 120)}</p>
                  </div>
                  <div className="admin-support-actions" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary admin-btn--sm"
                      disabled={resolving || req.status === "resolved"}
                      onClick={() => resolveRequest(req.id)}
                    >
                      {req.status === "resolved"
                        ? "Đã xử lý"
                        : resolving
                          ? "Đang xử lý…"
                          : "Đánh dấu đã xử lý"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="admin-flex-between" style={{ marginTop: 12 }}>
          <p className="admin-muted" style={{ fontSize: 12 }}>
            Trang {supportPage}/{supportTotalPages}
          </p>
          <div className="admin-filter-row">
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              disabled={supportPage <= 1}
              onClick={() => setSupportPage((current) => Math.max(1, current - 1))}
            >
              Trang trước
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--sm"
              disabled={supportPage >= supportTotalPages}
              onClick={() =>
                setSupportPage((current) => Math.min(supportTotalPages, current + 1))
              }
            >
              Trang sau
            </button>
          </div>
        </div>
        </div>
      </div>

      {error ? (
        <p className="admin-msg admin-msg--error">{error}</p>
      ) : null}
      {message ? (
        <p className="admin-msg admin-msg--success">{message}</p>
      ) : null}

      <div className="admin-table-wrap admin-only-desktop">
        <table className="admin-table">
          <thead className="text-xs uppercase tracking-wide admin-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center admin-muted">
                  Chưa có người dùng
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => {
                const busy = isPending && pendingId === user.id;
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium admin-text">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.role === "admin"
                            ? "admin-status-chip admin-status-chip--emerald"
                            : "admin-status-chip admin-status-chip--teal"
                        }
                      >
                        {user.role === "admin" ? "Admin" : "Khách hàng"}
                      </span>
                    </td>
                    <td className="px-4 py-3 admin-muted">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {user.role === "admin" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRole(user.id, "user")}
                            title="Hạ xuống khách hàng"
                            className="admin-icon-btn disabled:opacity-50"
                          >
                            <ShieldOff className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setRole(user.id, "admin")}
                            title="Gán admin"
                            className="admin-icon-btn disabled:opacity-50"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDelete(user)}
                          title="Xóa tài khoản"
                          className="admin-icon-btn disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-order-mobile-list admin-only-mobile" style={{ marginTop: 12 }}>
        {filteredUsers.length === 0 ? (
          <p className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
            Chưa có người dùng
          </p>
        ) : (
          pagedUsers.map((user) => {
            const busy = isPending && pendingId === user.id;
            return (
              <article key={user.id} className="admin-mobile-card" style={{ cursor: "default" }}>
                <div className="admin-mobile-card__head">
                  <p className="admin-text" style={{ fontWeight: 600, wordBreak: "break-all" }}>
                    {user.email}
                  </p>
                  <span
                    className={
                      user.role === "admin"
                        ? "admin-status-chip admin-status-chip--emerald"
                        : "admin-status-chip admin-status-chip--teal"
                    }
                  >
                    {user.role === "admin" ? "Admin" : "Khách hàng"}
                  </span>
                </div>
                <div className="admin-mobile-card__body">
                  <p>Ngày tạo: {formatDate(user.created_at)}</p>
                </div>
                <div className="admin-user-actions">
                  {user.role === "admin" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setRole(user.id, "user")}
                      title="Hạ xuống khách hàng"
                      className="admin-icon-btn"
                    >
                      <ShieldOff className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setRole(user.id, "admin")}
                      title="Gán admin"
                      className="admin-icon-btn"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(user)}
                    title="Xóa tài khoản"
                    className="admin-icon-btn"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="admin-flex-between" style={{ marginTop: 12 }}>
        <p className="admin-muted" style={{ fontSize: 12 }}>
          Trang {userPage}/{userTotalPages}
        </p>
        <div className="admin-filter-row">
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            disabled={userPage <= 1}
            onClick={() => setUserPage((current) => Math.max(1, current - 1))}
          >
            Trang trước
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--sm"
            disabled={userPage >= userTotalPages}
            onClick={() => setUserPage((current) => Math.min(userTotalPages, current + 1))}
          >
            Trang sau
          </button>
        </div>
      </div>
    </section>
  );
}
