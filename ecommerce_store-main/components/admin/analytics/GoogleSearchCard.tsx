import { Search } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

export function GoogleSearchCard() {
  return (
    <AnalyticsCard title="Hiệu suất Google Search">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Search className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed admin-muted">
            Xem cách người dùng tìm thấy bạn trên Google. Kết nối trang web của
            bạn với Google Search Console để xem hiệu suất.
          </p>
          <button type="button" className="admin-btn mt-4">
            Kết nối Search Console
          </button>
        </div>
      </div>
    </AnalyticsCard>
  );
}
