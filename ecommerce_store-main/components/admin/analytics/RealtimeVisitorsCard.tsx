"use client";

import { Activity } from "lucide-react";
import { MOCK_LIVE_VISITORS } from "@/lib/admin/analytics/mock-data";
import { AnalyticsCard } from "./AnalyticsCard";

export function RealtimeVisitorsCard() {
  return (
    <AnalyticsCard title="Khách truy cập theo thời gian thực">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Live
            </span>
          </div>
          <p className="mt-3 text-5xl font-bold tabular-nums tracking-tight admin-text sm:text-6xl">
            {MOCK_LIVE_VISITORS.onlineNow}
          </p>
          <p className="mt-2 text-sm admin-muted">
            người dùng đang online ngay lúc này
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Activity className="h-9 w-9" aria-hidden />
        </div>
      </div>
      <p className="mt-5 border-t border-[var(--admin-border)] pt-4 text-sm leading-relaxed admin-muted">
        {MOCK_LIVE_VISITORS.hint}
      </p>
    </AnalyticsCard>
  );
}
