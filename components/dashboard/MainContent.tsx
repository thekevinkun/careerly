"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import JobList from "./JobList";
import RightPanel from "./RightPanel";
import NotesSection from "./NotesSection";

const MainContent = () => {
  const searchParams = useSearchParams();

  const selectedJobId = searchParams.get("job") || null;

  return (
    <main className="flex-1 h-screen pt-6 pb-3 px-6 grid grid-rows-[1fr_32%] gap-6">
      {/* Top row: job applications + right panel */}
      <div className="grid grid-cols-3 gap-6 overflow-hidden">
        {/* Job applications */}
        <section className="col-span-2 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <JobList selectedJobId={selectedJobId} />
            </CardContent>
          </Card>
        </section>

        {/* Right Panel */}
        <section className="col-span-1 flex flex-col">
          <RightPanel />
        </section>
      </div>

      {/* Bottom row: Notes */}
      <section className="overflow-hidden">
        <NotesSection selectedJobId={selectedJobId} />
      </section>
    </main>
  );
};

export default MainContent;
