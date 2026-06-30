"use client";

import { Activity } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

type RealtimeVisitorsCardProps = {
  count: number;
  configured: boolean;
};

export function RealtimeVisitorsCard({
  count,
  configured,
}: RealtimeVisitorsCardProps) {
  return (
    <AnalyticsCard title="Real-time visitors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {configured ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              ) : null}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${configured ? "bg-emerald-500" : "bg-slate-500"}`}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              {configured ? "Live" : "Waiting for data"}
            </span>
          </div>
          <p className="mt-3 text-5xl font-bold tabular-nums tracking-tight admin-text sm:text-6xl">
            {count}
          </p>
          <p className="mt-2 text-sm admin-muted">
            online · refreshing every 5 seconds
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Activity className="h-9 w-9" aria-hidden />
        </div>
      </div>
      <p className="mt-5 border-t border-[var(--admin-border)] pt-4 text-sm leading-relaxed admin-muted">
        {configured
          ? "See device, country, and active page details below."
          : "Run supabase/analytics.sql + analytics-v2.sql then open the store."}
      </p>
    </AnalyticsCard>
  );
}
