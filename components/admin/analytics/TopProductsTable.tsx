import Link from "next/link";
import type { TopProductRow } from "@/lib/admin/analytics/types";
import { AnalyticsCard } from "./AnalyticsCard";

type TopProductsTableProps = {
  products: TopProductRow[];
};

export function TopProductsTable({ products }: TopProductsTableProps) {
  const rows = products.length > 0 ? products : [];

  return (
    <AnalyticsCard
      title="Lượt xem & click theo sản phẩm"
      subtitle="14 ngày gần nhất — trang chi tiết + click từ danh mục"
    >
      {rows.length === 0 ? (
        <p className="text-sm admin-muted">Chưa có lượt xem sản phẩm nào.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th style={{ textAlign: "right" }}>Lượt xem</th>
                <th style={{ textAlign: "right" }}>Click</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.productId}>
                  <td className="admin-muted">{index + 1}</td>
                  <td>
                    <Link
                      href={`/products/${row.productId}`}
                      className="admin-link font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {row.name}
                    </Link>
                    <p className="text-xs admin-muted">{row.productId}</p>
                  </td>
                  <td
                    className="text-right tabular-nums font-semibold"
                    style={{ color: "var(--admin-success)" }}
                  >
                    {row.views.toLocaleString("vi-VN")}
                  </td>
                  <td className="text-right tabular-nums font-semibold admin-text">
                    {row.clicks.toLocaleString("vi-VN")}
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
