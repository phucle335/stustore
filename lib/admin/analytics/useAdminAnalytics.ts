"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalyticsDashboard } from "@/lib/admin/analytics/types";

const POLL_MS = 5_000;

export function useAdminAnalytics() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics", {
        credentials: "include",
        cache: "no-store",
      });
      const body = (await res.json()) as {
        data?: AnalyticsDashboard;
        error?: string;
      };
      if (!res.ok) {
        setError(body.error || "Could not load analytics");
        return;
      }
      setData(body.data ?? null);
      setError(null);
    } catch {
      setError("Analytics connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  return { data, loading, error, refresh: load };
}
