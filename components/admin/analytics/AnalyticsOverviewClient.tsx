"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useAdminAnalytics } from "@/lib/admin/analytics/useAdminAnalytics";
import { ButtonClicksList } from "./ButtonClicksList";
import { EngagementMetricCards } from "./EngagementMetricCards";
import { LiveVisitorsDetail } from "./LiveVisitorsDetail";
import { OrderProfitCard } from "./OrderProfitCard";
import { RealtimeVisitorsCard } from "./RealtimeVisitorsCard";
import { RecentInteractionsTable } from "./RecentInteractionsTable";
import { SessionsLineChart } from "./SessionsLineChart";
import { TopPagesTable } from "./TopPagesTable";
import { TopProductsTable } from "./TopProductsTable";
import { TrafficSourcesChart } from "./TrafficSourcesChart";

export function AnalyticsOverviewClient() {
  const { data, loading, error, refresh } = useAdminAnalytics();

  if (loading && !data) {
    return (
      <p className="text-sm admin-muted">Loading analytics data…</p>
    );
  }

  if (!data) {
    return (
      <div className="admin-card p-5">
        <p className="text-sm text-red-400">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!data.configured ? (
        <div className="admin-card border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm leading-relaxed text-amber-100/90">
            {data.vercel.note}
          </p>
          <p className="mt-2 text-xs admin-muted">
            Run <code className="text-xs">analytics.sql</code> and{" "}
            <code className="text-xs">analytics-v2.sql</code> in Supabase.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs admin-muted suppress-hydration">
          Updated:{" "}
          {new Date(data.lastUpdated).toLocaleTimeString("vi-VN")}
          {data.configured ? " · realtime ~5s" : ""}
        </p>
        <button type="button" className="admin-btn" onClick={() => void refresh()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {data.vercel.dashboardUrl ? (
        <div className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold admin-text">Vercel Web Analytics</p>
            <p className="mt-1 text-xs admin-muted">{data.vercel.note}</p>
          </div>
          <a
            href={data.vercel.dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--primary inline-flex shrink-0 items-center gap-2"
          >
            Open Vercel Analytics
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : null}

      <div className="admin-grid-4" style={{ gridTemplateColumns: "1fr" }}>
        <RealtimeVisitorsCard
          count={data.liveVisitors}
          configured={data.configured}
        />
      </div>

      <LiveVisitorsDetail
        visitors={data.liveVisitorsList}
        deviceBreakdown={data.liveDeviceBreakdown}
        countryBreakdown={data.liveCountryBreakdown}
      />

      <RecentInteractionsTable rows={data.recentInteractions} />

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Products & interactions
        </h3>
        <div className="admin-grid-2">
          <TopProductsTable products={data.topProducts} />
          <ButtonClicksList clicks={data.buttonClicks} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Understanding your visitors
        </h3>
        <div className="admin-grid-2">
          <SessionsLineChart data={data.sessionsOverTime} />
          <TrafficSourcesChart data={data.trafficSources} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Exploring engagement levels
        </h3>
        <div className="space-y-4">
          <EngagementMetricCards metrics={data.engagement} />
          <TopPagesTable pages={data.topPages} />
        </div>
      </div>

      <OrderProfitCard
        rows={data.orderProfit.rows}
        totalProfit={data.orderProfit.totalProfit}
        totalRevenue={data.orderProfit.totalRevenue}
        totalOrders={data.orderProfit.totalOrders}
        totalItems={data.orderProfit.totalItems}
      />
    </div>
  );
}
