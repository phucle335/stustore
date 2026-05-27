import { MOCK_RECENT_ACTIVITY } from "@/lib/admin/analytics/mock-data";

export function RecentActivityCard() {
  return (
    <section className="admin-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="admin-card-title">Hoạt động gần đây</h2>
          <p className="admin-card-sub">Cập nhật mới nhất từ cửa hàng</p>
        </div>
        <button type="button" className="admin-btn">
          Xem tất cả
        </button>
      </div>
      <ul className="admin-activity-list">
        {MOCK_RECENT_ACTIVITY.map((item) => (
          <li key={item.id} className="admin-activity-item">
            <span className="admin-activity-avatar">{item.initials}</span>
            <div>
              <p className="text-sm admin-text">
                <strong>{item.name}</strong> {item.action}
              </p>
              <p className="text-xs admin-muted">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
