"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/store/types";
import { ProductCard } from "./ProductCard";
import styles from "@/styles/components/store/ProductCatalog.module.css";

const DEFAULT_PAGE_SIZE = 16;

type ProductGridProps = {
  products: Product[];
  pageSize?: number;
  showRating?: boolean;
  showSaleBadge?: boolean;
  lightSurface?: boolean;
};

export function ProductGrid({
  products,
  pageSize = DEFAULT_PAGE_SIZE,
  showRating = false,
  showSaleBadge = false,
  lightSurface = false,
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
    <div className={styles.productGridWrapper} ref={gridRef}>
      <div className={styles.productGrid}>
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showRating={showRating}
            showSaleBadge={showSaleBadge}
            lightSurface={lightSurface}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className={styles.productPagination} aria-label="Product pagination">
          <button
            type="button"
            className={styles.paginationBtn}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <i className="fas fa-chevron-left" aria-hidden="true" />
            Previous
          </button>

          <div className={styles.paginationPages}>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`${styles.paginationPage}${pageNumber === currentPage ? ` ${styles.active}` : ""}`}
                onClick={() => goToPage(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? "page" : undefined}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.paginationBtn}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Sau
            <i className="fas fa-chevron-right" aria-hidden="true" />
          </button>
        </nav>
      ) : null}

      <p className={styles.paginationInfo}>
        Showing {(currentPage - 1) * pageSize + 1}–
        {Math.min(currentPage * pageSize, products.length)} of{" "}
        {products.length} products
      </p>
    </div>
  );
}
