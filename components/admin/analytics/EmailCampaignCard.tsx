import { Mail } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

export function EmailCampaignCard() {
  return (
    <AnalyticsCard title="Expand your reach with Email">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Mail className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed admin-muted">
            Reach potential customers with targeted email campaigns.
          </p>
          <button type="button" className="admin-btn admin-btn--primary mt-4">
            Create Email Campaign
          </button>
        </div>
      </div>
    </AnalyticsCard>
  );
}
