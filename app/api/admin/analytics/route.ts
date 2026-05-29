import { jsonResult, withAdminApi } from "@/lib/admin/api";
import { fetchAnalyticsDashboard } from "@/lib/admin/analytics/data";

export async function GET() {
  return withAdminApi(async () => {
    const data = await fetchAnalyticsDashboard();
    return { ok: true as const, data };
  });
}
