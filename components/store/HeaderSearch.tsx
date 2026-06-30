"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitStoreSearch } from "@/lib/store/search-navigation";
import styles from "@/styles/components/store/Header.module.css";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    submitStoreSearch(router, query);
  };

  return (
    <form className={styles.headerSearch} onSubmit={handleSubmit} role="search">
      <label htmlFor="header-search-input" className={styles.srOnly}>
        Search products
      </label>
      <input
        id="header-search-input"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products..."
        autoComplete="off"
      />
      <button type="submit" aria-label="Search">
        <i className="fas fa-search" aria-hidden="true" />
      </button>
    </form>
  );
}
