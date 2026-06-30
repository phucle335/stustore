/** Mock data — Featured Highlights (preview UI) */

export const MOCK_LIVE_VISITORS = {
  onlineNow: 24,
  hint: "Visitor activity will appear here in real time.",
};

export const MOCK_SESSIONS_OVER_TIME = [
  { label: "T2", sessions: 420 },
  { label: "T3", sessions: 512 },
  { label: "T4", sessions: 488 },
  { label: "T5", sessions: 610 },
  { label: "T6", sessions: 720 },
  { label: "T7", sessions: 890 },
  { label: "CN", sessions: 760 },
  { label: "T2", sessions: 540 },
  { label: "T3", sessions: 598 },
  { label: "T4", sessions: 645 },
  { label: "T5", sessions: 702 },
  { label: "T6", sessions: 810 },
  { label: "T7", sessions: 940 },
  { label: "CN", sessions: 820 },
];

export const MOCK_TRAFFIC_SOURCES = [
  { name: "Direct", value: 42, fill: "#34d399" },
  { name: "Google Ads", value: 35, fill: "#38bdf8" },
  { name: "Facebook Ads", value: 23, fill: "#a78bfa" },
];

export const MOCK_ENGAGEMENT_METRICS = {
  avgPagesPerSession: "4.2",
  avgSessionDuration: "3m 18s",
  bounceRate: "38.5%",
};

export const MOCK_TOP_PAGES = [
  { path: "/", title: "Home", views: 4820 },
  { path: "/sneakers", title: "Sneakers", views: 2910 },
  { path: "/products/sneaker-1", title: "Nike Air Force 1", views: 1640 },
  { path: "/clothing", title: "Clothing", views: 1320 },
  { path: "/checkout", title: "Checkout", views: 890 },
];

export const MOCK_BUTTON_CLICKS = [
  { label: 'Buy Now / Add to Cart button', clicks: 150 },
  { label: 'Register button', clicks: 85 },
  { label: 'Cart icon (Header)', clicks: 312 },
  { label: 'Checkout button', clicks: 64 },
  { label: 'Favorite product', clicks: 41 },
];

export const MOCK_FOOTER_PRESENCE = {
  visitorsOnline: 18,
  staffOnline: 4,
};

export const MOCK_RECENT_ACTIVITY = [
  {
    id: "1",
    name: "Customer",
    initials: "CU",
    action: "placed new order #4287",
    time: "2 hours ago",
  },
  {
    id: "2",
    name: "Admin",
    initials: "AD",
    action: "updated product Sneaker",
    time: "5 hours ago",
  },
  {
    id: "3",
    name: "System",
    initials: "SY",
    action: "synced inventory by size",
    time: "Yesterday",
  },
  {
    id: "4",
    name: "VIP Customer",
    initials: "VIP",
    action: "applied coupon STU10",
    time: "2 days ago",
  },
];
