"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AnalyticsCard } from "./AnalyticsCard";

type TrafficSourcesChartProps = {
  data: { name: string; value: number; fill: string }[];
};

export function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  const chartData =
    data.length > 0
      ? data
      : [{ name: "No data yet", value: 100, fill: "#94a3b8" }];

  return (
    <AnalyticsCard
      title="Top traffic sources"
      subtitle="By referrer — last 14 days"
    >
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, "Share"]}
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
