"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type AnalyticsTablePaginationProps = {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function AnalyticsTablePagination({
  page,
  totalPages,
  from,
  to,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: AnalyticsTablePaginationProps) {
  if (total <= 0) return null;

  return (
    <div className="admin-analytics-pagination">
      <p className="admin-analytics-pagination__meta">
        {from}–{to} / {total} · Page {page}/{totalPages}
      </p>
      <div className="admin-analytics-pagination__actions">
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Prev
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--sm"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
