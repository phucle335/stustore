"use client";

import type { InteractionRow } from "@/lib/admin/analytics/types";
import { AnalyticsTablePagination } from "./AnalyticsTablePagination";
import { AnalyticsCard } from "./AnalyticsCard";
import { useTablePagination } from "./useTablePagination";

const PAGE_SIZE = 6;

type RecentInteractionsTableProps = {
  rows: InteractionRow[];
};

export function RecentInteractionsTable({ rows }: RecentInteractionsTableProps) {
  const pagination = useTablePagination(rows, PAGE_SIZE);
  const list = pagination.slice;

  return (
    <AnalyticsCard
      title="Recent activity (realtime)"
      subtitle="Visitor #… · button clicks · product views · device · country"
    >
      {rows.length === 0 ? (
        <p className="text-sm admin-muted">No interactions recorded yet.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Visitor</th>
                  <th>Type</th>
                  <th>Action</th>
                  <th>Device</th>
                  <th>Country</th>
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
                        {row.kind === "product_view" ? "View" : "Click"}
                      </span>
                    </td>
                    <td className="max-w-[200px]">
                      <p
                        className="truncate text-sm font-medium admin-text"
                        title={row.label}
                      >
                        {row.label}
                      </p>
                      {row.productName ? (
                        <p className="truncate text-xs admin-muted">
                          {row.productName}
                        </p>
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
