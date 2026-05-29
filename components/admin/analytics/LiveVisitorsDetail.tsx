"use client";

import { Globe, Monitor, Smartphone } from "lucide-react";
import type { BreakdownItem, LiveVisitorRow } from "@/lib/admin/analytics/types";
import { AnalyticsTablePagination } from "./AnalyticsTablePagination";
import { AnalyticsCard } from "./AnalyticsCard";
import { useTablePagination } from "./useTablePagination";

const VISITOR_PAGE_SIZE = 5;

type LiveVisitorsDetailProps = {
  visitors: LiveVisitorRow[];
  deviceBreakdown: BreakdownItem[];
  countryBreakdown: BreakdownItem[];
};

function BreakdownList({
  title,
  items,
  icon,
}: {
  title: string;
  items: BreakdownItem[];
  icon: React.ReactNode;
}) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide admin-muted">
        {icon}
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm admin-muted">Chưa có dữ liệu</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="admin-text">{item.name}</span>
                <span className="tabular-nums font-semibold admin-text">
                  {item.count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-border)]">
                <div
                  className="h-full rounded-full bg-[#f24e35]"
                  style={{ width: `${Math.round((item.count / total) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LiveVisitorsDetail({
  visitors,
  deviceBreakdown,
  countryBreakdown,
}: LiveVisitorsDetailProps) {
  const pagination = useTablePagination(visitors, VISITOR_PAGE_SIZE);
  const pageRows = pagination.slice;

  return (
    <AnalyticsCard
      title="Khách đang online (realtime)"
      subtitle="Cập nhật ~5 giây · Desktop/Mobile · Quốc gia theo IP"
    >
      <div className="admin-grid-2 mb-5 gap-6">
        <BreakdownList
          title="Thiết bị (live)"
          items={deviceBreakdown}
          icon={<Monitor className="h-3.5 w-3.5" aria-hidden />}
        />
        <BreakdownList
          title="Quốc gia (live)"
          items={countryBreakdown}
          icon={<Globe className="h-3.5 w-3.5" aria-hidden />}
        />
      </div>

      {visitors.length === 0 ? (
        <p className="text-sm admin-muted">Chưa có ai online trong 2 phút gần nhất.</p>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách</th>
                  <th>Trang</th>
                  <th>Thiết bị</th>
                  <th>Quốc gia</th>
                  <th style={{ textAlign: "right" }}>Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={`${row.sessionShort}-${row.lastSeen}`}>
                    <td className="font-mono text-xs admin-text">
                      #{row.sessionShort}
                    </td>
                    <td className="max-w-[140px] truncate text-sm" title={row.path}>
                      {row.path}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-sm">
                        {row.device === "Mobile" ? (
                          <Smartphone className="h-3.5 w-3.5 admin-muted" />
                        ) : (
                          <Monitor className="h-3.5 w-3.5 admin-muted" />
                        )}
                        {row.device}
                      </span>
                    </td>
                    <td className="text-sm">{row.country}</td>
                    <td className="text-right text-xs tabular-nums admin-muted">
                      {new Date(row.lastSeen).toLocaleTimeString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.showPagination ? (
            <AnalyticsTablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              from={pagination.from}
              to={pagination.to}
              total={pagination.total}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              onPrev={pagination.goPrev}
              onNext={pagination.goNext}
            />
          ) : null}
        </>
      )}
    </AnalyticsCard>
  );
}
