"use client";

import { useState, useTransition } from "react";
import { Shield, ShieldOff, Trash2 } from "lucide-react";
import {
  assignRoleAction,
  deleteUserAction,
} from "@/lib/admin/actions/users";
import type { DbUser, UserRole } from "@/lib/supabase/types";

type CustomerManagerProps = {
  initialUsers: DbUser[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CustomerManager({ initialUsers }: CustomerManagerProps) {
  const [users, setUsers] = useState(initialUsers);
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
