"use client";

import { useEffect, useMemo, useState } from "react";

export function useTablePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return {
    page,
    setPage,
    totalPages,
    total,
    slice,
    from,
    to,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    goPrev: () => setPage((p) => Math.max(1, p - 1)),
    goNext: () => setPage((p) => Math.min(totalPages, p + 1)),
    showPagination: total > pageSize,
  };
}
