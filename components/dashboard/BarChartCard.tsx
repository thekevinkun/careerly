"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { fetcher } from "@/lib/helpers";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3b82f6", // blue-500
  interviewing: "#f59e0b", // amber-500
  offer: "#10b981", // green-500
  rejected: "#ef4444", // red-500
};

const BarChartCard = () => {
  const { data: statusSummary } = useSWR<
    { status: string; _count: { status: number } }[]
  >("/api/jobs/status-summary", fetcher);

  const chartData = statusSummary?.map((s) => ({
    status: s.status,
    value: s._count.status,
  }));

  return (
    <Card className="flex flex-col !px-0 xl:!px-5 flex-1">
      <CardHeader>
        <CardTitle>Applications by Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[132px]">
        {!statusSummary ? (
          <p className="text-primary animate-pulse">Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              barCategoryGap={5}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="status"
                tickLine={false}
                tick={false}
                axisLine={false}
                width={0}
              />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status.toLowerCase()]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
