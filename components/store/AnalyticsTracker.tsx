"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseProductIdFromPath } from "@/lib/analytics/parse-request";

const SESSION_KEY = "stusport_analytics_sid";
const HEARTBEAT_MS = 20_000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function getDeviceHint(): string {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify({ ...payload, deviceHint: getDeviceHint() });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/collect", blob);
    return;
  }
  void fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const title = typeof document !== "undefined" ? document.title : "";
    const referrer =
      lastPath.current === null ? document.referrer || "" : "";
    const productId = parseProductIdFromPath(pathname);

    send({
      type: "pageview",
      sessionId,
      path: pathname,
      title,
      referrer,
      productId: productId ?? undefined,
    });
    lastPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const tick = () => {
      send({
        type: "heartbeat",
        sessionId,
        path: pathname,
        title: document.title,
      });
    };

    tick();
    const id = window.setInterval(tick, HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const sessionId = getSessionId();

      const trackEl = target?.closest<HTMLElement>("[data-track]");
      if (trackEl) {
        const label = trackEl.getAttribute("data-track");
        if (label) {
          const href = trackEl.getAttribute("href");
          const productFromHref = href ? parseProductIdFromPath(href) : null;
          send({
            type: "click",
            sessionId,
            path: pathname,
            label,
            productId:
              productFromHref ||
              parseProductIdFromPath(pathname) ||
              undefined,
          });
        }
      }

      const productLink = target?.closest<HTMLElement>("a[href*='/products/']");
      if (productLink && !trackEl) {
        const href = productLink.getAttribute("href") ?? "";
        const productId = parseProductIdFromPath(href);
        if (productId) {
          const name =
            productLink.getAttribute("data-product-name") ||
            productLink.getAttribute("aria-label") ||
            productLink.textContent?.trim()?.slice(0, 80) ||
            productId;
          send({
            type: "click",
            sessionId,
            path: pathname,
            label: `Mở sản phẩm: ${name}`,
            productId,
          });
        }
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
