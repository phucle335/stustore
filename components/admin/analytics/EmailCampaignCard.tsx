import { Mail } from "lucide-react";
import { AnalyticsCard } from "./AnalyticsCard";

export function EmailCampaignCard() {
  return (
    <AnalyticsCard title="Mở rộng đối tượng qua Email">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Mail className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed admin-muted">
            Tiếp cận khách hàng tiềm năng bằng các chiến dịch email tùy chỉnh.
          </p>
          <button type="button" className="admin-btn admin-btn--primary mt-4">
            Tạo chiến dịch Email ngay
          </button>
        </div>
      </div>
    </AnalyticsCard>
  );
}
