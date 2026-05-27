/** Dữ liệu mẫu — Tổng quan nổi bật (preview UI) */

export const MOCK_LIVE_VISITORS = {
  onlineNow: 24,
  hint: "Hoạt động của khách truy cập sẽ hiển thị tại đây theo thời gian thực.",
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
  { name: "Trực tiếp (Direct)", value: 42, fill: "#34d399" },
  { name: "Google Ads", value: 35, fill: "#38bdf8" },
  { name: "Facebook Ads", value: 23, fill: "#a78bfa" },
];

export const MOCK_ENGAGEMENT_METRICS = {
  avgPagesPerSession: "4.2",
  avgSessionDuration: "3m 18s",
  bounceRate: "38.5%",
};

export const MOCK_TOP_PAGES = [
  { path: "/", title: "Trang chủ", views: 4820 },
  { path: "/sneakers", title: "Sneaker", views: 2910 },
  { path: "/products/sneaker-1", title: "Nike Air Force 1", views: 1640 },
  { path: "/clothing", title: "Clothes", views: 1320 },
  { path: "/checkout", title: "Thanh toán", views: 890 },
];

export const MOCK_BUTTON_CLICKS = [
  { label: 'Nút "Mua ngay" / Thêm giỏ', clicks: 150 },
  { label: 'Nút "Đăng ký"', clicks: 85 },
  { label: "Icon giỏ hàng (Header)", clicks: 312 },
  { label: 'Nút "Thanh toán"', clicks: 64 },
  { label: "Yêu thích sản phẩm", clicks: 41 },
];

export const MOCK_FOOTER_PRESENCE = {
  visitorsOnline: 18,
  staffOnline: 4,
};

export const MOCK_RECENT_ACTIVITY = [
  {
    id: "1",
    name: "Khách hàng",
    initials: "KH",
    action: "đặt đơn hàng mới #4287",
    time: "2 giờ trước",
  },
  {
    id: "2",
    name: "Admin",
    initials: "AD",
    action: "cập nhật sản phẩm Sneaker",
    time: "5 giờ trước",
  },
  {
    id: "3",
    name: "Hệ thống",
    initials: "ST",
    action: "đồng bộ tồn kho theo size",
    time: "Hôm qua",
  },
  {
    id: "4",
    name: "Khách VIP",
    initials: "VIP",
    action: "áp dụng mã giảm giá STU10",
    time: "2 ngày trước",
  },
];
