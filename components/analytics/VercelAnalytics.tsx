import { Analytics } from "@vercel/analytics/next";

/** Web Analytics — only works when deployed on Vercel */
export function VercelAnalytics() {
  return <Analytics />;
}
