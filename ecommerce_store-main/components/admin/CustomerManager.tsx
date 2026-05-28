"use client";

import { useMemo, useState, useTransition } from "react";
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
}: CustomerManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [supportRequests, setSupportRequests] = useState(
    initialSupportRequests ?? [],
  );
  const openSupportRequests = useMemo(
    () => supportRequests.filter((r) => r.status === "open"),
    [supportRequests],
  );
  const [resolvingRequestId, setResolvingRequestId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      <div className="mb-5">
        <h2 className="text-lg font-semibold admin-text">
          Khách hàng & phân quyền
        </h2>
        <p className="text-sm admin-muted">
          Gán role admin hoặc user cho từng tài khoản
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-base font-semibold admin-text">
          Khách hàng cần hỗ trợ
        </h3>
        <p className="text-sm admin-muted">
          Yêu cầu mới gửi từ footer Contact (Zalo/Email)
        </p>

        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
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
              {openSupportRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center admin-muted"
                  >
                    Chưa có yêu cầu mới
                  </td>
                </tr>
              ) : (
                openSupportRequests.slice(0, 5).map((req) => {
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
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn--primary"
                            disabled={resolving}
                            onClick={() => resolveRequest(req.id)}
                          >
                            {resolving ? "Đang xử lý…" : "Đã xử lý"}
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
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-lg bg-[#1e2a3a]/10 px-3 py-2 text-sm text-[#1e2a3a]">
          {message}
        </p>
      ) : null}

      <div className="admin-table-wrap">
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center admin-muted">
                  Chưa có người dùng
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const busy = isPending && pendingId === user.id;
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium admin-text">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                          user.role === "admin"
                            ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30"
                            : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
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
    </section>
  );
}
