"use client";

import { useEffect, useState } from "react";
import { MOCK_FOOTER_PRESENCE } from "@/lib/admin/analytics/mock-data";

export function LivePresenceBar() {
  const [visitors, setVisitors] = useState(MOCK_FOOTER_PRESENCE.visitorsOnline);

  useEffect(() => {
    const base = MOCK_FOOTER_PRESENCE.visitorsOnline;
    const tick = () => {
      const delta = Math.floor(Math.random() * 5) - 2;
      setVisitors(Math.max(3, base + delta));
    };
    const id = window.setInterval(tick, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="site-footer-presence" role="status" aria-live="polite">
      <div className="site-footer-presence-item">
        <span className="site-footer-presence-dot" aria-hidden />
        <span>
          Khách truy cập:{" "}
          <strong>{visitors}</strong>
        </span>
      </div>
      <div className="site-footer-presence-item">
        <span className="site-footer-presence-dot site-footer-presence-dot--staff" aria-hidden />
        <span>
          Nhân viên online:{" "}
          <strong>{MOCK_FOOTER_PRESENCE.staffOnline}</strong>
        </span>
      </div>
    </div>
  );
}
