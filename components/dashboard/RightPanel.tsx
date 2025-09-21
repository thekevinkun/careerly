"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { fetcher } from "@/lib/helpers";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3b82f6", // blue-500
  interviewing: "#f59e0b", // amber-500
  offer: "#10b981", // green-500
  rejected: "#ef4444", // red-500
};

const RightPanel = () => {
  const { data: statusSummary } = useSWR<
    { status: string; _count: { status: number } }[]
  >("/api/jobs/status-summary", fetcher);

  const chartData = statusSummary?.map((s) => ({
    status: s.status,
    value: s._count.status,
  }));

  return (
    <aside className="h-full w-full flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Resume & Cover Letter</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
            Generate Suggestions
          </Button>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          {!statusSummary ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                barCategoryGap={7}
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
    </aside>
  );
};

export default RightPanel;
