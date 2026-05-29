import { MousePointerClick } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

type ButtonClicksListProps = {
  clicks: { label: string; clicks: number }[];
};

export function ButtonClicksList({ clicks }: ButtonClicksListProps) {
  const rows = clicks.length > 0 ? clicks : [];

  return (
    <AnalyticsCard
      title="Tổng hợp click nút"
      subtitle="Mua ngay, thêm giỏ, CTA… — chi tiết từng khách ở bảng realtime phía trên"
    >
      {rows.length === 0 ? (
        <p className="text-sm admin-muted">
          Chưa có click nào. Ví dụ:{" "}
          <code className="text-xs">data-track=&quot;Mua ngay&quot;</code>
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--admin-muted)] shadow-sm">
                  <MousePointerClick className="h-4 w-4" aria-hidden />
                </span>
                <span className="truncate text-sm admin-text">{item.label}</span>
              </div>
              <span
                className="shrink-0 text-sm font-semibold tabular-nums"
                style={{ color: "var(--admin-success)" }}
              >
                {item.clicks} clicks
              </span>
            </li>
          ))}
        </ul>
      )}
    </AnalyticsCard>
  );
}
