"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SESSION_KEY = "stusport_analytics_sid";
const HEARTBEAT_MS = 25_000;

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

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
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

    send({
      type: "pageview",
      sessionId,
      path: pathname,
      title,
      referrer,
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
      const el = target?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const label = el.getAttribute("data-track");
      if (!label) return;
      send({
        type: "click",
        sessionId: getSessionId(),
        path: pathname,
        label,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
