"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Separator } from "@/components/ui/separator";
import AddJobForm from "@/components/dashboard/AddJobForm";
import LogoutButton from "@/components/LogoutButton";

import { Job, JobStatus } from "@/types/job";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const initialCounts: Record<JobStatus, number> = {
  applied: 0,
  interviewing: 0,
  offer: 0,
  rejected: 0,
};

const Sidebar = () => {
  const { data, error } = useSWR<Job[]>("/api/jobs", fetcher);
  const jobs: Job[] = Array.isArray(data) ? data : [];

  // Compute counts with useMemo (still always called)
  const counts = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        const status = job.status.toLowerCase() as JobStatus;
        if (status in acc) acc[status]++;
        return acc;
      },
      { ...initialCounts }
    );
  }, [jobs]);

  const isLoading = !data && !error;

  return (
    <aside className="w-64 bg-card border-r flex-shrink-0 flex flex-col p-6">
      <h1 className="logo text-2xl font-bold text-primary mb-8">Careerly</h1>

      <AddJobForm />

      <nav className="space-y-2 text-sm">
        {["Applied", "Interviewing", "Offer", "Rejected"].map((status) => {
          const key = status.toLowerCase();
          const value = counts[key as keyof typeof counts] ?? 0;

          return (
            <div
              key={status}
              className="flex justify-between items-center px-2 py-1 rounded hover:bg-muted cursor-pointer"
            >
              <span>{status}</span>

              {/* stable-size badge so layout doesn't jump */}
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full min-w-[36px] text-center">
                {isLoading ? (
                  <span className="inline-block w-6 h-3 rounded bg-muted animate-pulse" />
                ) : error ? (
                  "—"
                ) : (
                  value
                )}
              </span>
            </div>
          );
        })}
      </nav>

      <Separator className="my-6" />

      {error && (
        <div className="text-sm text-destructive mb-3">
          Failed to load status
        </div>
      )}

      <LogoutButton />
    </aside>
  );
};

export default Sidebar;
