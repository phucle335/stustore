"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PAGE_ROUTES } from "@/lib/store/site";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return;
    }
    router.push(`${PAGE_ROUTES.search}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form className="header-search" onSubmit={handleSubmit} role="search">
      <label htmlFor="header-search-input" className="sr-only">
        Tìm kiếm sản phẩm
      </label>
      <input
        id="header-search-input"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        autoComplete="off"
      />
      <button type="submit" aria-label="Tìm kiếm">
        <i className="fas fa-search" aria-hidden="true" />
      </button>
    </form>
  );
}
