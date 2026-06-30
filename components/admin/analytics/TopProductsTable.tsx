"use client";

import Link from "next/link";
import type { TopProductRow } from "@/lib/admin/analytics/types";
import { AnalyticsTablePagination } from "./AnalyticsTablePagination";
import { AnalyticsCard } from "./AnalyticsCard";
import { useTablePagination } from "./useTablePagination";

const PAGE_SIZE = 5;

type TopProductsTableProps = {
  products: TopProductRow[];
};

export function TopProductsTable({ products }: TopProductsTableProps) {
  const pagination = useTablePagination(products, PAGE_SIZE);
  const rows = pagination.slice;

  return (
    <AnalyticsCard
      title="Product views & clicks"
      subtitle="Last 14 days — detail pages + category clicks"
    >
      {products.length === 0 ? (
        <p className="text-sm admin-muted">No product views recorded yet.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th style={{ textAlign: "right" }}>Views</th>
                  <th style={{ textAlign: "right" }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.productId}>
                    <td className="admin-muted">
                      {(pagination.page - 1) * PAGE_SIZE + index + 1}
                    </td>
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
