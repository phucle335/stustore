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
    <section className="admin-card">
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

      {tab === "admin" ? (
        <>
          <div className="admin-table-wrap admin-only-desktop" style={{ marginTop: 12 }}>
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
                        <td className="admin-text" style={{ fontWeight: 600, wordBreak: "break-all" }}>
                          {actorEmail}
                        </td>
                        <td className="admin-muted">{log.action}</td>
                        <td className="admin-muted">{entity}</td>
                        <td className="admin-muted" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-log-list admin-only-mobile" style={{ marginTop: 12 }}>
            {adminAudit.length === 0 ? (
              <p className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
                Chưa có log
              </p>
            ) : (
              adminAudit.map((log) => {
                const actorEmail = log.admin_user_id
                  ? emailById.get(log.admin_user_id) ?? log.admin_user_id.slice(0, 8)
                  : "—";
                const entity = `${safeText(log.entity_type)}${log.entity_id ? ` #${log.entity_id}` : ""}`;
                return (
                  <article key={log.id} className="admin-log-card">
                    <div className="admin-log-card__row">
                      <span className="admin-log-card__email">{actorEmail}</span>
                      <span className="admin-muted" style={{ flexShrink: 0 }}>
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <div className="admin-log-card__row">
                      <span className="admin-muted">{log.action}</span>
                    </div>
                    <div className="admin-log-card__row">
                      <span className="admin-muted">{entity}</span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div className="admin-table-wrap admin-only-desktop" style={{ marginTop: 12 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th style={{ textAlign: "right" }}>Thời gian</th>
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
                        <div className="admin-text" style={{ fontWeight: 600, marginBottom: 4 }}>
                          {n.title}
                        </div>
                        {n.body ? (
                          <div style={{ lineHeight: 1.4, wordBreak: "break-word" }}>
                            {String(n.body).slice(0, 120)}
                            {String(n.body).length > 120 ? "…" : ""}
                          </div>
                        ) : null}
                      </td>
                      <td className="admin-muted" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {formatDate(n.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-log-list admin-only-mobile" style={{ marginTop: 12 }}>
            {supportAndOrderNotifications.length === 0 ? (
              <p className="admin-muted" style={{ textAlign: "center", padding: 18 }}>
                Chưa có thông báo
              </p>
            ) : (
              supportAndOrderNotifications.map((n) => (
                <article key={n.id} className="admin-log-card">
                  <div className="admin-log-card__row">
                    <span className="admin-text" style={{ fontWeight: 600 }}>
                      {n.title}
                    </span>
                    <span className="admin-muted" style={{ flexShrink: 0 }}>
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                  {n.body ? (
                    <p className="admin-muted" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                      {String(n.body).slice(0, 160)}
                      {String(n.body).length > 160 ? "…" : ""}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
