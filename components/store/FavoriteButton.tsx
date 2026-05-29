"use client";

import { useEffect, useState } from "react";
import { useCustomerAuth } from "./CustomerAuthProvider";
import styles from "@/styles/components/store/ProductCatalog.module.css";

type FavoriteButtonProps = {
  productId: string;
  className?: string;
};

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { user } = useCustomerAuth();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setActive(false);
      return;
    }

    let cancelled = false;
    void fetch("/api/account/favorites", { credentials: "include" })
      .then((res) => res.json())
      .then((body: { data?: string[] }) => {
        if (!cancelled && body.data) {
          setActive(body.data.includes(productId));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, productId]);

  if (!user) return null;

  async function toggle() {
    setLoading(true);
    if (active) {
      await fetch(
        `/api/account/favorites?product_id=${encodeURIComponent(productId)}`,
        { method: "DELETE", credentials: "include" },
      );
      setActive(false);
    } else {
      await fetch("/api/account/favorites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      setActive(true);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      className={className ?? "product-favorite-btn"}
      disabled={loading}
      onClick={() => void toggle()}
      aria-label={active ? "Bỏ yêu thích" : "Thêm yêu thích"}
    >
      <i className={active ? "fas fa-heart" : "far fa-heart"} />
    </button>
  );
}
