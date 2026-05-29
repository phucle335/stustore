"use client";

import { AnalyticsTablePagination } from "./AnalyticsTablePagination";
import { AnalyticsCard } from "./AnalyticsCard";
import { useTablePagination } from "./useTablePagination";

const PAGE_SIZE = 5;

type TopPagesTableProps = {
  pages: { path: string; title: string; views: number }[];
};

export function TopPagesTable({ pages }: TopPagesTableProps) {
  const pagination = useTablePagination(pages, PAGE_SIZE);
  const rows = pagination.slice;

  return (
    <AnalyticsCard
      title="Trang truy cập nhiều nhất"
      subtitle="Top trang theo lượt xem"
    >
      {pages.length === 0 ? (
        <p className="text-sm admin-muted">Chưa có lượt xem nào được ghi nhận.</p>
      ) : (
        <>
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
                    <td className="admin-muted">
                      {(pagination.page - 1) * PAGE_SIZE + index + 1}
                    </td>
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
          {pagination.showPagination ? (
            <AnalyticsTablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              from={pagination.from}
              to={pagination.to}
              total={pagination.total}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              onPrev={pagination.goPrev}
              onNext={pagination.goNext}
            />
          ) : null}
        </>
      )}
    </AnalyticsCard>
  );
}
