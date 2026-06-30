import { Search } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

export function GoogleSearchCard() {
  return (
    <AnalyticsCard title="Google Search Performance">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Search className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed admin-muted">
            See how users find you on Google. Connect your site to Google Search Console to view performance.
          </p>
          <button type="button" className="admin-btn mt-4">
            Connect Search Console
          </button>
        </div>
      </div>
    </AnalyticsCard>
  );
}
