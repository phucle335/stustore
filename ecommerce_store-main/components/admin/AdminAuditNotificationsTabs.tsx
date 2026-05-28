"use client";

import { useMemo, useState } from "react";
import type { AdminAuditLog, DbNotification, DbUser } from "@/lib/supabase/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

type Props = {
  auditLogs: AdminAuditLog[];
  notifications: DbNotification[];
  users: DbUser[];
};

export function AdminAuditNotificationsTabs({
  auditLogs,
  notifications,
  users,
}: Props) {
  const [tab, setTab] = useState<"admin" | "support">("admin");

  const emailById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.email);
    return map;
  }, [users]);

  const supportAndOrderNotifications = useMemo(() => {
    return notifications.filter((n) => n.type !== "admin_action").slice(0, 12);
  }, [notifications]);

  const adminAudit = useMemo(() => auditLogs.slice(0, 12), [auditLogs]);

  return (
    <section>
      <div className="admin-tab-bar">
        <button
          type="button"
          className={`admin-tab-btn${tab === "admin" ? " is-active" : ""}`}
          onClick={() => setTab("admin")}
        >
          Admin — thao tác
        </button>
        <button
          type="button"
          className={`admin-tab-btn${tab === "support" ? " is-active" : ""}`}
          onClick={() => setTab("support")}
        >
          Khách hàng & đơn
        </button>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: 12 }}>
        {tab === "admin" ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Thao tác</th>
                <th>Đối tượng</th>
                <th style={{ textAlign: "right" }}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {adminAudit.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
                    Chưa có log
                  </td>
                </tr>
              ) : (
                adminAudit.map((log) => {
                  const actorEmail = log.admin_user_id
                    ? emailById.get(log.admin_user_id) ?? log.admin_user_id.slice(0, 8)
                    : "—";
                  const entity = `${safeText(log.entity_type)}${log.entity_id ? ` #${log.entity_id}` : ""}`;
                  return (
                    <tr key={log.id}>
                      <td className="admin-text font-medium">{actorEmail}</td>
                      <td className="admin-muted">{log.action}</td>
                      <td className="admin-muted">{entity}</td>
                      <td className="admin-muted" style={{ textAlign: "right" }}>
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nội dung</th>
                <th style={{ width: 110, textAlign: "right" }}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {supportAndOrderNotifications.length === 0 ? (
                <tr>
                  <td colSpan={2} className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
                    Chưa có thông báo
                  </td>
                </tr>
              ) : (
                supportAndOrderNotifications.map((n) => (
                  <tr key={n.id}>
                    <td className="admin-muted">
                      <div className="admin-text font-medium" style={{ marginBottom: 4 }}>
                        {n.title}
                      </div>
                      {n.body ? (
                        <div style={{ maxWidth: 360, lineHeight: 1.4 }}>
                          {String(n.body).slice(0, 120)}
                          {String(n.body).length > 120 ? "…" : ""}
                        </div>
                      ) : null}
                    </td>
                    <td className="admin-muted" style={{ textAlign: "right" }}>
                      {formatDate(n.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

