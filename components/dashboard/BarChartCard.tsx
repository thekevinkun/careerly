"use client";

import { useRef, useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { fetcher } from "@/lib/helpers";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3b82f6",
  interviewing: "#f59e0b",
  offer: "#10b981",
  rejected: "#ef4444",
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

const BarChartCard = () => {
  const { data: statusSummary, isLoading } = useSWR(
    "/api/jobs/status-summary",
    fetcher
  );

  const chartData = statusSummary?.map((s: any) => ({
    status: s.status,
    value: s._count.status,
  }));

  const total = (chartData || []).reduce((s: any, d: any) => s + d.value, 0);

  // Hover state stores index + position relative to card content
  const [hovered, setHovered] = useState<{
    index: number;
    left: number; // px relative to container
    top: number; // px relative to container
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isInside) {
        setHovered(null);
      }
    };

    document.addEventListener("mousemove", handleMove);
    return () => document.removeEventListener("mousemove", handleMove);
  }, []);

  if (isLoading) {
    return (
      <Card className="flex flex-col !px-0 flex-1">
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[137px] flex items-center justify-center">
          <p className="text-primary animate-pulse">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!statusSummary || !chartData) {
    return (
      <Card className="flex flex-col !px-0 flex-1">
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-[137px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm text-center">
            No applications yet—start tracking your jobs!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col !px-0 flex-1">
      <CardHeader>
        <CardTitle>Applications by Status</CardTitle>
        <p className="text-xs text-muted-foreground">Total: {total}</p>
      </CardHeader>

      {/* containerRef used to position tooltip relative to this element */}
      <CardContent ref={containerRef} className="flex-1 min-h-[137px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            barCategoryGap={5}
            // fallback: if mouse leaves the whole chart area, clear hover
            onMouseLeave={() => setHovered(null)}
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

            {/* custom shape: we draw rect ourselves and attach mouse events */}
            <Bar
              dataKey="value"
              // radius kept by not using Cell's default shape
              shape={(props: any) => {
                const { x, y, width, height, payload, index } = props;

                // color from payload (you can also compute from STATUS_COLORS)
                const fill =
                  STATUS_COLORS[payload.status.toLowerCase()] ?? "#ccc";

                // Important: the DOM mouse handler receives the MouseEvent, so we can compute page coords
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={5}
                    ry={5}
                    fill={fill}
                    // mouse events on the actual bar only
                    onMouseEnter={(e: React.MouseEvent<SVGRectElement>) => {
                      const containerRect =
                        containerRef.current?.getBoundingClientRect();
                      if (!containerRect) return;

                      // position relative to container:
                      const relativeLeft = e.clientX - containerRect.left;
                      const relativeTop = e.clientY - containerRect.top;

                      // clamp so tooltip won't overflow horizontally (some padding)
                      const clampedLeft = clamp(
                        relativeLeft,
                        8,
                        (containerRect.width || 300) - 140 - 8
                      );

                      setHovered({
                        index,
                        left: clampedLeft,
                        top: relativeTop,
                      });
                    }}
                    onMouseLeave={() => {
                      // Clear hover when pointer leaves the rect
                      setHovered(null);
                    }}
                  />
                );
              }}
            >
              {chartData.map((entry: any, i: number) => (
                <Cell
                  key={`cell-${i}`}
                  fill={STATUS_COLORS[entry.status.toLowerCase()]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Tooltip — placed with absolute coords relative to CardContent */}
        {hovered !== null && (
          <div
            className="absolute bg-white/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg min-w-[120px] z-20 pointer-events-none"
            // top slightly above mouse; left from hovered.left
            style={{
              left: hovered.left,
              top: Math.max(hovered.top - 48, 8),
            }}
          >
            <div
              className="font-medium capitalize text-sm"
              style={{
                color:
                  STATUS_COLORS[chartData[hovered.index].status.toLowerCase()],
              }}
            >
              {chartData[hovered.index].status}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {chartData[hovered.index].value}
            </div>
            <div className="text-xs text-muted-foreground">
              {total > 0
                ? ((chartData[hovered.index].value / total) * 100).toFixed(1) +
                  "%"
                : "0%"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
