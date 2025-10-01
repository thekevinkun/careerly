"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import AddJobForm from "@/components/modals/AddJobForm";
import LogoutButton from "@/components/LogoutButton";

import { Job, JobStatus } from "@/types/globals";
import { fetcher } from "@/lib/helpers";

import BarChartCard from "./BarChartCard";

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

  const isLoading = !data && !error;

  return (
    <aside className="w-80 lg:w-72 bg-white/80 backdrop-blur-md flex-shrink-0 flex flex-col p-6 shadow-sm">
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

      <div className="mt-5 flex flex-1 sm:hidden">
        <BarChartCard />
      </div>

      <nav className="mt-5 lg:mt-0 space-y-2 text-sm">
        {["Applied", "Interviewing", "Offer", "Rejected"].map((status) => {
          const key = status.toLowerCase();
          const value = counts[key as keyof typeof counts] ?? 0;

          return (
            <div
              key={status}
              className="flex-between px-2 py-1 rounded hover:bg-muted cursor-pointer"
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

      <div className="w-full mt-auto">
        <div
          className="group relative flex items-center gap-3 w-full p-3 rounded-full
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

          {/* content sits above overlay */}
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
  );
};

export default Sidebar;
