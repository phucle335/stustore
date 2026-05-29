import { MousePointerClick } from "lucide-react";
import { MOCK_BUTTON_CLICKS } from "@/lib/admin/analytics/mock-data";
import { AnalyticsCard } from "./AnalyticsCard";

export function ButtonClicksList() {
  return (
    <AnalyticsCard
      title="Theo dõi lượt click nút"
      subtitle="Bật theo dõi lần nhấp để tìm hiểu thêm (dữ liệu mẫu)"
    >
      <ul className="space-y-3">
        {MOCK_BUTTON_CLICKS.map((item) => (
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
    </AnalyticsCard>
  );
}
