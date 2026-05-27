"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MOCK_TRAFFIC_SOURCES } from "@/lib/admin/analytics/mock-data";
import { AnalyticsCard } from "./AnalyticsCard";

export function TrafficSourcesChart() {
  return (
    <AnalyticsCard
      title="Nguồn lưu lượng hàng đầu"
      subtitle="Top traffic sources — tỷ lệ % (dữ liệu mẫu)"
    >
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={MOCK_TRAFFIC_SOURCES}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {MOCK_TRAFFIC_SOURCES.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, "Tỷ lệ"]}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                color: "#1e293b",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#64748b" }}
              formatter={(value) => (
                <span className="admin-text">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
