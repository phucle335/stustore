import { MOCK_TOP_PAGES } from "@/lib/admin/analytics/mock-data";
import { AnalyticsCard } from "./AnalyticsCard";

export function TopPagesTable() {
  return (
    <AnalyticsCard
      title="Trang truy cập nhiều nhất"
      subtitle="Top 5 trang theo lượt xem (dữ liệu mẫu)"
    >
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Trang</th>
              <th style={{ textAlign: "right" }}>Lượt xem</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TOP_PAGES.map((row, index) => (
              <tr key={row.path}>
                <td className="admin-muted">{index + 1}</td>
                <td>
                  <p className="font-medium admin-text">{row.title}</p>
                  <p className="text-xs admin-muted">{row.path}</p>
                </td>
                <td
                  className="tabular-nums font-semibold"
                  style={{ textAlign: "right", color: "var(--admin-success)" }}
                >
                  {row.views.toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalyticsCard>
  );
}
