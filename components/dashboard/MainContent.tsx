"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import JobList from "./JobList";
import RightPanel from "./RightPanel";
import NotesSection from "./NotesSection";

const MainContent = () => {
  const searchParams = useSearchParams();

  const selectedJobId = searchParams.get("job") || null;

  return (
    <ScrollArea className="h-full w-full">
      <main className="min-h-full w-full p-6 space-y-6">
        {/* Top row: job applications + right panel */}
        <div className="grid grid-cols-3 gap-6">
          {/* Job applications */}
          <section className="col-span-2 flex flex-col">
            <Card className="h-full w-full flex flex-col">
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <JobList selectedJobId={selectedJobId} />
              </CardContent>
            </Card>
          </section>

          {/* Right Panel */}
          <section className="col-span-1 flex flex-col">
            <RightPanel selectedJobId={selectedJobId} />
          </section>
        </div>

        {/* Bottom row: Notes */}
        <section className="w-full h-56 overflow-hidden">
          <NotesSection selectedJobId={selectedJobId} />
        </section>
      </main>
    </ScrollArea>
  );
};

export default MainContent;
