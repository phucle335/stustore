import type { InteractionRow } from "@/lib/admin/analytics/types";
import { AnalyticsCard } from "./AnalyticsCard";

type RecentInteractionsTableProps = {
  rows: InteractionRow[];
};

export function RecentInteractionsTable({ rows }: RecentInteractionsTableProps) {
  const list = rows.length > 0 ? rows : [];

  return (
    <AnalyticsCard
      title="Hoạt động gần đây (realtime)"
      subtitle="Khách #… · nút bấm · xem sản phẩm · thiết bị · quốc gia"
    >
      {list.length === 0 ? (
        <p className="text-sm admin-muted">Chưa có tương tác nào được ghi nhận.</p>
      ) : (
        <div className="admin-table-wrap max-h-96 overflow-y-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Khách</th>
                <th>Loại</th>
                <th>Hành động</th>
                <th>Thiết bị</th>
                <th>Quốc gia</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, i) => (
                <tr key={`${row.at}-${row.sessionShort}-${i}`}>
                  <td className="whitespace-nowrap text-xs tabular-nums admin-muted">
                    {new Date(row.at).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </td>
                  <td className="font-mono text-xs">#{row.sessionShort}</td>
                  <td>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.kind === "product_view"
                          ? "bg-sky-500/15 text-sky-700"
                          : "bg-violet-500/15 text-violet-700"
                      }`}
                    >
                      {row.kind === "product_view" ? "Xem SP" : "Click"}
                    </span>
                  </td>
                  <td className="max-w-[200px]">
                    <p className="truncate text-sm font-medium admin-text" title={row.label}>
                      {row.label}
                    </p>
                    {row.productName ? (
                      <p className="truncate text-xs admin-muted">{row.productName}</p>
                    ) : (
                      <p className="truncate text-xs admin-muted">{row.path}</p>
                    )}
                  </td>
                  <td className="text-sm">{row.device}</td>
                  <td className="text-sm">{row.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AnalyticsCard>
  );
}
