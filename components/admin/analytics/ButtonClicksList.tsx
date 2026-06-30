"use client";

import { MousePointerClick } from "lucide-react";
import { AnalyticsTablePagination } from "./AnalyticsTablePagination";
import { AnalyticsCard } from "./AnalyticsCard";
import { useTablePagination } from "./useTablePagination";

const PAGE_SIZE = 6;

type ButtonClicksListProps = {
  clicks: { label: string; clicks: number }[];
};

export function ButtonClicksList({ clicks }: ButtonClicksListProps) {
  const pagination = useTablePagination(clicks, PAGE_SIZE);
  const rows = pagination.slice;

  return (
    <AnalyticsCard
      title="Button clicks summary"
      subtitle="Buy now, add to cart, CTA… — individual visitor events in the realtime table above"
    >
      {clicks.length === 0 ? (
        <p className="text-sm admin-muted">
          No clicks recorded yet. Example:{" "}
          <code className="text-xs">data-track=&quot;Buy Now&quot;</code>
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {rows.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--admin-muted)] shadow-sm">
                    <MousePointerClick className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="truncate text-sm admin-text">{item.label}</span>
                </div>
                <span
                  className="shrink-0 text-sm font-semibold tabular-nums"
                  style={{ color: "var(--admin-success)" }}
                >
                  {item.clicks} clicks
                </span>
              </li>
            ))}
          </ul>
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
