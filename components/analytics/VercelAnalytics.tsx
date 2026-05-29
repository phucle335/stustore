import { Analytics } from "@vercel/analytics/next";

/** Web Analytics — chỉ hoạt động khi deploy trên Vercel */
export function VercelAnalytics() {
  return <Analytics />;
}
