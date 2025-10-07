"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import JobList from "./JobList";
import RightPanel from "./RightPanel";
import NotesSection from "./NotesSection";

import { Job } from "@/types/job";
import { fetcher } from "@/lib/helpers";

const MainContent = () => {
  const searchParams = useSearchParams();
  const { data, error, isLoading } = useSWR<Job[]>("/api/jobs", fetcher);
  const selectedJobId = searchParams.get("job") || null;

  return (
    <ScrollArea className="h-full w-full">
      <main className="min-h-full w-full max-md:pb-0 py-6 pl-4 pr-5 space-y-6">
        {/* Top row: job applications + right panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job applications */}
          <section className="md:h-[472px] order-2 lg:order-1 col-span-2 flex flex-col">
            <Card className="h-full w-full flex flex-col px-0 md:!px-2 overflow-hidden">
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <JobList
                  data={data}
                  error={error}
                  isLoading={isLoading}
                  selectedJobId={selectedJobId}
                />
              </CardContent>
            </Card>
          </section>

          {/* Right Panel */}
          <section className="order-1 lg:order-2 col-span-2 lg:col-span-1 flex flex-col">
            <RightPanel isLoading={isLoading} selectedJobId={selectedJobId} />
          </section>
        </div>

        {/* Bottom row: Notes */}
        <section className="hidden md:block w-full h-64">
          <NotesSection selectedJobId={selectedJobId} />
        </section>
      </main>
    </ScrollArea>
  );
};

export default MainContent;
