import { ButtonClicksList } from "./ButtonClicksList";
import { EmailCampaignCard } from "./EmailCampaignCard";
import { EngagementMetricCards } from "./EngagementMetricCards";
import { GoogleSearchCard } from "./GoogleSearchCard";
import { RealtimeVisitorsCard } from "./RealtimeVisitorsCard";
import { SessionsLineChart } from "./SessionsLineChart";
import { TopPagesTable } from "./TopPagesTable";
import { TrafficSourcesChart } from "./TrafficSourcesChart";

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div className="admin-grid-4" style={{ gridTemplateColumns: "1fr" }}>
        <RealtimeVisitorsCard />
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Tìm hiểu về khách truy cập
        </h3>
        <div className="admin-grid-2">
          <SessionsLineChart />
          <TrafficSourcesChart />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Khám phá mức độ tương tác
        </h3>
        <div className="space-y-4">
          <EngagementMetricCards />
          <div className="admin-grid-2">
            <TopPagesTable />
            <ButtonClicksList />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide admin-muted">
          Phân tích hiệu quả tiếp thị
        </h3>
        <div className="admin-grid-2">
          <GoogleSearchCard />
          <EmailCampaignCard />
        </div>
      </div>
    </div>
  );
}
