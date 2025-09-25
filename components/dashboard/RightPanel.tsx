"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import AiResultDialog from "@/components/modals/AiResultDialog";

import { fetcher } from "@/lib/helpers";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3b82f6", // blue-500
  interviewing: "#f59e0b", // amber-500
  offer: "#10b981", // green-500
  rejected: "#ef4444", // red-500
};

const RightPanel = ({ selectedJobId }: { selectedJobId?: string | null }) => {
  // Status summary for chart
  const { data: statusSummary } = useSWR<
    { status: string; _count: { status: number } }[]
  >("/api/jobs/status-summary", fetcher);

  const chartData = statusSummary?.map((s) => ({
    status: s.status,
    value: s._count.status,
  }));

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    resume: string;
    coverLetter: string;
    isAiGenerated: boolean;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    if (!selectedJobId) return;
    setLoading(true);

    try {
      // call resume API
      const resumeRes = await fetch(
        `/api/jobs/${selectedJobId}/resume-generate`,
        {
          method: "POST",
        }
      );
      if (!resumeRes.ok) throw new Error("Failed to generate resume");
      const resumeData = await resumeRes.json();

      // call cover letter API
      const coverRes = await fetch(
        `/api/jobs/${selectedJobId}/cover-letter-generate`,
        {
          method: "POST",
        }
      );
      if (!coverRes.ok) throw new Error("Failed to generate cover letter");
      const coverData = await coverRes.json();

      setAiResult({
        resume: resumeData.resume,
        coverLetter: coverData.coverLetter,
        isAiGenerated: resumeData.isAiGenerated && coverData.isAiGenerated,
      });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="h-full w-full flex flex-col gap-6">
      {/* AI Powered */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Resume & Cover Letter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!selectedJobId ? (
            <p className="text-sm text-muted-foreground italic">
              Select a job from the list to generate
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Ready to generate
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!selectedJobId || loading}
          >
            {loading ? "Generating..." : "Generate Suggestions"}
          </Button>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {!statusSummary ? (
            <p className="text-primary animate-pulse">Loading...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                barCategoryGap={4}
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

      {/* AI Result Dialog */}
      <AiResultDialog
        selectedJobId={selectedJobId || null}
        open={showModal}
        onOpenChange={setShowModal}
        aiResult={aiResult}
      />
    </aside>
  );
};

export default RightPanel;
