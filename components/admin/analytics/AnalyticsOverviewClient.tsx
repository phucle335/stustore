"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useAdminAnalytics } from "@/lib/admin/analytics/useAdminAnalytics";
import { ButtonClicksList } from "./ButtonClicksList";
import { EngagementMetricCards } from "./EngagementMetricCards";
import { RealtimeVisitorsCard } from "./RealtimeVisitorsCard";
import { SessionsLineChart } from "./SessionsLineChart";
import { TopPagesTable } from "./TopPagesTable";
import { TrafficSourcesChart } from "./TrafficSourcesChart";

export function AnalyticsOverviewClient() {
  const { data, loading, error, refresh } = useAdminAnalytics();

  if (loading && !data) {
    return (
      <p className="text-sm admin-muted">Đang tải dữ liệu analytics…</p>
    );
  }

  if (!data) {
    return (
      <div className="admin-card p-5">
        <p className="text-sm text-red-400">{error || "Không có dữ liệu"}</p>
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
            Sau khi chạy SQL, deploy site và duyệt vài trang — số liệu sẽ cập nhật
            mỗi 15 giây.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs admin-muted">
          Cập nhật:{" "}
          {new Date(data.lastUpdated).toLocaleTimeString("vi-VN")}
          {data.configured ? " · realtime ~15s" : ""}
        </p>
        <button type="button" className="admin-btn" onClick={() => void refresh()}>
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {data.vercel.dashboardUrl ? (
        <div className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold admin-text">Vercel Web Analytics</p>
            <p className="mt-1 text-xs admin-muted">
              Xem heatmap, funnel và traffic chi tiết trên dashboard Vercel (khi
              deploy production).
            </p>
          </div>
          <a
            href={data.vercel.dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--primary inline-flex shrink-0 items-center gap-2"
          >
            Mở Vercel Analytics
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

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Tìm hiểu về khách truy cập
        </h3>
        <div className="admin-grid-2">
          <SessionsLineChart data={data.sessionsOverTime} />
          <TrafficSourcesChart data={data.trafficSources} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Khám phá mức độ tương tác
        </h3>
        <div className="space-y-4">
          <EngagementMetricCards metrics={data.engagement} />
          <div className="admin-grid-2">
            <TopPagesTable pages={data.topPages} />
            <ButtonClicksList clicks={data.buttonClicks} />
          </div>
        </div>
      </div>
    </div>
  );
}
