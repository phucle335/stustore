"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/store/types";
import { ProductCard } from "./ProductCard";

const DEFAULT_PAGE_SIZE = 16;

type ProductGridProps = {
  products: Product[];
  pageSize?: number;
  showRating?: boolean;
  showSaleBadge?: boolean;
};

export function ProductGrid({
  products,
  pageSize = DEFAULT_PAGE_SIZE,
  showRating = false,
  showSaleBadge = false,
}: ProductGridProps) {
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [products, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!shouldScrollRef.current) {
      return;
    }

    shouldScrollRef.current = false;
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const goToPage = (nextPage: number): void => {
    const clampedPage = Math.max(1, Math.min(nextPage, totalPages));

    if (clampedPage !== currentPage) {
      shouldScrollRef.current = true;
    }

    setPage(clampedPage);
  };

  const pageNumbers = useMemo((): number[] => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  return (
    <div className="product-grid-wrapper" ref={gridRef}>
      <div className="product-grid">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showRating={showRating}
            showSaleBadge={showSaleBadge}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="product-pagination" aria-label="Phân trang sản phẩm">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Trang trước"
          >
            <i className="fas fa-chevron-left" aria-hidden="true" />
            Trước
          </button>

          <div className="pagination-pages">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`pagination-page${pageNumber === currentPage ? " active" : ""}`}
                onClick={() => goToPage(pageNumber)}
                aria-label={`Trang ${pageNumber}`}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Trang sau"
          >
            Sau
            <i className="fas fa-chevron-right" aria-hidden="true" />
          </button>
        </nav>
      ) : null}

      <p className="pagination-info">
        Hiển thị {(currentPage - 1) * pageSize + 1}–
        {Math.min(currentPage * pageSize, products.length)} trong{" "}
        {products.length} sản phẩm
      </p>
    </div>
  );
}
