export type AnalyticsDashboard = {
  configured: boolean;
  liveVisitors: number;
  sessionsOverTime: { label: string; sessions: number }[];
  trafficSources: { name: string; value: number; fill: string }[];
  engagement: {
    avgPagesPerSession: string;
    avgSessionDuration: string;
    bounceRate: string;
  };
  topPages: { path: string; title: string; views: number }[];
  buttonClicks: { label: string; clicks: number }[];
  vercel: {
    enabled: boolean;
    dashboardUrl: string | null;
    note: string;
  };
  lastUpdated: string;
};

export const TRAFFIC_SOURCE_COLORS = [
  "#34d399",
  "#38bdf8",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#94a3b8",
];
