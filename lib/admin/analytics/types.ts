export type BreakdownItem = { name: string; count: number };

export type LiveVisitorRow = {
  sessionShort: string;
  path: string;
  device: string;
  country: string;
  lastSeen: string;
};

export type TopProductRow = {
  productId: string;
  name: string;
  views: number;
  clicks: number;
};

export type InteractionRow = {
  at: string;
  kind: "click" | "product_view";
  sessionShort: string;
  label: string;
  path: string;
  productId: string | null;
  productName: string | null;
  device: string;
  country: string;
};

export type AnalyticsDashboard = {
  configured: boolean;
  liveVisitors: number;
  liveVisitorsList: LiveVisitorRow[];
  liveDeviceBreakdown: BreakdownItem[];
  liveCountryBreakdown: BreakdownItem[];
  sessionsOverTime: { label: string; sessions: number }[];
  trafficSources: { name: string; value: number; fill: string }[];
  engagement: {
    avgPagesPerSession: string;
    avgSessionDuration: string;
    bounceRate: string;
  };
  topPages: { path: string; title: string; views: number }[];
  topProducts: TopProductRow[];
  buttonClicks: { label: string; clicks: number }[];
  recentInteractions: InteractionRow[];
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
