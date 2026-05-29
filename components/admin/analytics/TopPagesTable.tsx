import { AnalyticsCard } from "./AnalyticsCard";

type TopPagesTableProps = {
  pages: { path: string; title: string; views: number }[];
};

export function TopPagesTable({ pages }: TopPagesTableProps) {
  const rows = pages.length > 0 ? pages : [];

  return (
    <AnalyticsCard
      title="Trang truy cập nhiều nhất"
      subtitle="Top trang theo lượt xem"
    >
      {rows.length === 0 ? (
        <p className="text-sm admin-muted">Chưa có lượt xem nào được ghi nhận.</p>
      ) : (
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
              {rows.map((row, index) => (
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
      )}
    </AnalyticsCard>
  );
}
