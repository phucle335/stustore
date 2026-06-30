"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsCard } from "./AnalyticsCard";

type SessionsLineChartProps = {
  data: { label: string; sessions: number }[];
};

export function SessionsLineChart({ data }: SessionsLineChartProps) {
  const chartData =
    data && data.length > 0 ? data : [{ label: "—", sessions: 0 }];

  return (
    <AnalyticsCard
      title="Sessions over time"
      subtitle="Unique sessions — last 14 days"
    >
      <div className="h-64 w-full overflow-hidden sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                color: "#1e293b",
              }}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#38bdf8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
