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
    <main className="flex-1 h-screen p-6 grid grid-cols-3 grid-rows-[auto_1fr] gap-6">
      {/* Job applications */}
      <section className="col-span-2 overflow-y-auto">
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
      <section className="col-span-1 overflow-y-auto">
        <RightPanel />
      </section>

      {/* Notes at bottom */}
      <section className="col-span-3 overflow-y-auto">
        <NotesSection selectedJobId={selectedJobId}/>
      </section>
    </main>
  );
};

export default MainContent;
