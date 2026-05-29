"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/components/store/LivePresenceBar.module.css";

export function LivePresenceBar() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLive() {
      try {
        const res = await fetch("/api/analytics/live", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { visitors?: number };
        if (!cancelled && typeof json.visitors === "number") {
          setVisitors(json.visitors);
        }
      } catch {
        /* ignore */
      }
    }

    void fetchLive();
    const id = window.setInterval(() => void fetchLive(), 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const display = visitors ?? "—";

  return (
    <div className={styles.presence} role="status" aria-live="polite">
      <div className={styles.presenceItem}>
        <span className={styles.presenceDot} aria-hidden />
        <span>
          Khách truy cập: <strong>{display}</strong>
        </span>
      </div>
    </div>
  );
}
