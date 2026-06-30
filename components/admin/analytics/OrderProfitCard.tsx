"use client";

import { useMemo } from "react";
import { AnalyticsCard } from "./AnalyticsCard";
import { AnalyticsTablePagination } from "./AnalyticsTablePagination";
import { useTablePagination } from "./useTablePagination";
import type { OrderProfitRow } from "@/lib/admin/analytics/types";

const PAGE_SIZE = 10;

type OrderProfitCardProps = {
  rows: OrderProfitRow[];
  totalProfit: number;
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
};

function formatVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrderProfitCard({
  rows,
  totalProfit,
  totalRevenue,
  totalOrders,
  totalItems,
}: OrderProfitCardProps) {
  const pagination = useTablePagination(rows, PAGE_SIZE);
  const visibleRows = pagination.slice;

  const hasOriginPrice = useMemo(
    () => rows.some((r) => r.originPrice != null),
    [rows],
  );

  return (
    <AnalyticsCard
      title="Order Profit"
      subtitle={`Last 14 days — ${totalOrders} orders · ${totalItems} items`}
    >
      {/* Summary stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3 text-center">
          <p className="text-xs admin-muted">Revenue</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatVnd(totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <p className="text-xs text-emerald-300">Total Profit</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300">
            {formatVnd(totalProfit)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3 text-center">
          <p className="text-xs admin-muted">Profit Margin</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {totalRevenue > 0
              ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`
              : "—"}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm admin-muted">
          No completed orders in the last 14 days.
        </p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Selling Price</th>
                  {hasOriginPrice ? (
                    <th className="text-right">Origin Price</th>
                  ) : null}
                  {hasOriginPrice ? (
                    <th className="text-right">Profit / Item</th>
                  ) : null}
                  <th className="text-right">Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={`${row.orderId}-${row.productId ?? index}`}>
                    <td>
                      <div className="flex flex-col">
                        <span className="admin-text text-sm">
                          {row.productName ?? "—"}
                        </span>
                        <span className="text-xs admin-muted">
                          Order #{row.orderId.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="text-right tabular-nums admin-text">
                      {row.quantity}
                    </td>
                    <td className="text-right tabular-nums admin-text">
                      {formatVnd(row.sellingPrice)}
                    </td>
                    {hasOriginPrice ? (
                      <td className="text-right tabular-nums admin-muted">
                        {row.originPrice != null
                          ? formatVnd(row.originPrice)
                          : "—"}
                      </td>
                    ) : null}
                    {hasOriginPrice ? (
                      <td
                        className={`text-right tabular-nums font-semibold ${
                          row.profit > 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {row.originPrice != null
                          ? formatVnd(row.profit)
                          : "—"}
                      </td>
                    ) : null}
                    <td
                      className={`text-right tabular-nums font-semibold ${
                        row.totalProfit > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {row.originPrice != null
                        ? formatVnd(row.totalProfit)
                        : "—"}
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
