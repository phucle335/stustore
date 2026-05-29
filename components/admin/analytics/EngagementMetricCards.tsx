import { Clock, FileText, TrendingDown } from "lucide-react";

type EngagementMetricCardsProps = {
  metrics: {
    avgPagesPerSession: string;
    avgSessionDuration: string;
    bounceRate: string;
  };
};

const metricDefs = [
  {
    key: "pages",
    label: "Số trang trung bình mỗi phiên",
    sub: "Avg. Pages per Session",
    field: "avgPagesPerSession" as const,
    icon: FileText,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
  },
  {
    key: "duration",
    label: "Thời lượng phiên trung bình",
    sub: "Avg. Session Duration",
    field: "avgSessionDuration" as const,
    icon: Clock,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
  },
  {
    key: "bounce",
    label: "Tỷ lệ bỏ trang",
    sub: "Bounce Rate",
    field: "bounceRate" as const,
    icon: TrendingDown,
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
  },
] as const;

export function EngagementMetricCards({ metrics }: EngagementMetricCardsProps) {
  return (
    <div
      className="admin-grid-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      {metricDefs.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.key} className="admin-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs admin-muted">{item.sub}</p>
                <p className="mt-1 text-sm admin-text">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold admin-text">
                  {metrics[item.field]}
                </p>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: item.iconBg, color: item.iconColor }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
