"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import AddJobForm from "@/components/modals/AddJobForm";
import BarChartCard from "./BarChartCard";

import {
  ListChecks,
  Send,
  Calendar,
  Star,
  XCircle,
  TrendingUp,
} from "lucide-react";

import { Job, JobStatus } from "@/types/globals";
import { fetcher } from "@/lib/helpers";
import { ScrollArea } from "../ui/scroll-area";

const initialCounts: Record<JobStatus, number> = {
  applied: 0,
  interviewing: 0,
  offer: 0,
  rejected: 0,
};

const Sidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { data, error } = useSWR<Job[]>("/api/jobs", fetcher);
  const jobs: Job[] = Array.isArray(data) ? data : [];

  const isJobDetailPage = pathname.startsWith("/dashboard/jobs/");

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

  const stats = [
    {
      label: "Applied",
      value: counts.applied,
      icon: Send,
      iconBg: "bg-slate-100 text-slate-700",
    },
    {
      label: "Interviewing",
      value: counts.interviewing,
      icon: Calendar,
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      label: "Offers",
      value: counts.offer,
      icon: Star,
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      label: "Rejected",
      value: counts.rejected,
      icon: XCircle,
      iconBg: "bg-red-100 text-destructive",
    },
  ];

  const isLoading = !data && !error;

  return (
    <ScrollArea className="h-full w-full bg-white/80 backdrop-blur-md shadow-sm">
      <aside className="h-full w-80 lg:w-72 flex-shrink-0 flex flex-col p-6">
        <div className="w-full hidden lg:block text-end">
          {isJobDetailPage ? (
            <Link
              href="/dashboard"
              className="btn btn-primary mb-6 cursor-default"
            >
              ← Back to Dashboard
            </Link>
          ) : (
            <AddJobForm />
          )}
        </div>

        <div className="mt-5 flex sm:hidden">
          <BarChartCard />
        </div>

        <nav className="mt-5 lg:mt-0 space-y-3 text-sm">
          {/* Quick Stats Section */}
          <div className="mt-5 lg:mt-0 space-y-3 text-sm">
            {stats.map(({ label, value, icon: Icon, iconBg }) => (
              <div
                key={label}
                className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded ${iconBg}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{label}</span>
                </div>

                {/* stable-size badge like your original */}
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
            ))}

            {/* Success Rate (optional, matching style) */}
            <div className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer mt-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-100 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <span>Success Rate</span>
              </div>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full min-w-[36px] text-center">
                {jobs.length > 0
                  ? `${((counts.offer / jobs.length) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Recent Activity */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Recent Activity
            </h3>

            <div className="space-y-2 text-sm">
              {/* ✅ 1. Last Applied Job */}
              {jobs
                .filter((job) => job.status === "applied")
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 1)
                .map((job) => (
                  <div key={job.id} className="flex items-center gap-2">
                    <span>✅</span>
                    <span>
                      You applied to <strong>{job.company}</strong>
                    </span>
                  </div>
                ))}

              {/* ✅ 2. Last Interviewing Job */}
              {jobs
                .filter((job) => job.status === "interviewing")
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 1)
                .map((job) => (
                  <div key={job.id} className="flex items-center gap-2">
                    <span>📅</span>
                    <span>
                      Interview at <strong>{job.company}</strong>
                    </span>
                  </div>
                ))}

              {/* ✅ 3. Pending Updates */}
              <div className="flex items-center gap-2">
                <span>⏳</span>
                <span>
                  {counts.applied + counts.interviewing} pending updates
                </span>
              </div>
            </div>
          </div>
        </nav>

        {error && (
          <div className="text-sm text-destructive mb-3">
            Failed to load status
          </div>
        )}

        {/* Tag Account at bottom */}
        <div className="hidden lg:block w-full mt-auto">
          <div
            className="group relative flex items-center gap-3 w-full py-2 px-3 rounded-full
            bg-muted/60 transition-transform duration-300 ease-out
            hover:scale-[1.01]"
          >
            {/* Animated gradient overlay (fades in) */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full pointer-events-none opacity-0
                 transition-opacity duration-300 ease-out group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(110deg, rgba(16,183,127,0.16), rgba(16,183,127,0.04))",
                boxShadow: "0 10px 30px rgba(16,183,127,0.08)",
              }}
            />

            <div className="relative flex items-center gap-3 w-full">
              <Avatar className="h-10 w-10">
                {session?.user?.avatarUrl || session?.user?.avatarUrl ? (
                  <AvatarImage
                    src={session.user.avatarUrl || session.user.avatarUrl!}
                    alt={session.user.name || ""}
                  />
                ) : (
                  <AvatarFallback>
                    {session?.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {session?.user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </ScrollArea>
  );
};

export default Sidebar;
