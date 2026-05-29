"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MobileOverlayLogoHeader } from "@/components/store/MobileOverlayLogoHeader";
import { submitStoreSearch } from "@/lib/store/search-navigation";
import styles from "@/styles/components/store/MobileSearchSheet.module.css";

type MobileSearchSheetProps = {
  open: boolean;
  onClose: () => void;
  variant?: "store" | "motto";
};

export function MobileSearchSheet({
  open,
  onClose,
  variant = "store",
}: MobileSearchSheetProps): React.ReactElement {
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (submitStoreSearch(router, query)) {
      onClose();
    }
  };

  const sheetClass =
    variant === "motto" ? `${styles.sheet} ${styles.sheetMotto}` : styles.sheet;

  return (
    <div
      className={`${styles.root}${open ? ` ${styles.open}` : ""}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Đóng tìm kiếm"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        className={sheetClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <MobileOverlayLogoHeader
          onClose={onClose}
          closeLabel="Đóng tìm kiếm"
        />
        <div className={styles.sheetInner}>
          <form
            className={styles.searchForm}
            role="search"
            onSubmit={handleSubmit}
          >
            <label htmlFor="mobile-search-input" className={styles.srOnly}>
              Tìm kiếm sản phẩm
            </label>
            <input
              ref={inputRef}
              id="mobile-search-input"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              autoComplete="off"
            />
            <button type="submit" aria-label="Tìm kiếm">
              <i className="fas fa-search" aria-hidden="true" />
            </button>
          </form>
        </div>
        <span id={titleId} className={styles.srOnly}>
          Tìm kiếm
        </span>
      </div>
    </div>
  );
}
