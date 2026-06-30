"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/components/admin/format";
import type { RevenueMonth } from "@/lib/admin/stats";

type RevenueChartProps = {
  data: RevenueMonth[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <section className="admin-card">
      <div className="mb-6">
        <h2 className="admin-card-title">Revenue Trend</h2>
        <p className="admin-card-sub">
          Last 6 months — non-cancelled orders
        </p>
      </div>

      <div className="admin-chart-wrap">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              width={42}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value >= 1_000_000
                  ? `${Math.round(value / 1_000_000)}tr`
                  : `${Math.round(value / 1000)}k`
              }
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                color: "#1e293b",
              }}
              formatter={(value) => [
                formatCurrency(Number(value)),
                "Revenue",
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#adminRevenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
