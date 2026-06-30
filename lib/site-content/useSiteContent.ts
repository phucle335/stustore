/**
 * Client hook: fetch site content from `/api/site-content`.
 * Has internal cache so multiple components don't fetch repeatedly.
 */

// Note: file intentionally does not use hooks on module scope.
"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/site-content/site-content";
import { getDefaultSiteContent } from "@/lib/site-content/site-content";

let cache: SiteContent | null = null;
let inflight: Promise<SiteContent> | null = null;

async function fetchSiteContent(): Promise<SiteContent> {
  const res = await fetch("/api/site-content", { method: "GET" });
  if (!res.ok) throw new Error("Could not load site content");
  const json = (await res.json()) as { data?: SiteContent; error?: string };
  return json.data ?? getDefaultSiteContent();
}

export function useSiteContent() {
  const [data, setData] = useState<SiteContent>(cache ?? getDefaultSiteContent());
  const [loading, setLoading] = useState<boolean>(cache == null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (cache) {
          setData(cache);
          setLoading(false);
          return;
        }
        if (!inflight) {
          inflight = fetchSiteContent()
            .then((d) => {
              cache = d;
              inflight = null;
              return d;
            })
            .catch((e) => {
              inflight = null;
              throw e;
            });
        }
        const next = await inflight;
        if (!cancelled) {
          setData(next);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setData(getDefaultSiteContent());
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { siteContent: data, loading };
}

