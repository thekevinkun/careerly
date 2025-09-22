"use client";

import useSWR from "swr";
import moment from "moment";
import { useRouter } from "next/navigation";

import { Eye } from "lucide-react";
import { Trash2 } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";

import { Job } from "@/types/job";
import { fetcher, statusClass } from "@/lib/helpers";

const JobList = ({ selectedJobId }: { selectedJobId?: string | null }) => {
  const { data, error, mutate } = useSWR<Job[]>("/api/jobs", fetcher);

  const router = useRouter();

  if (error) return <div className="text-destructive">Failed to load jobs</div>;
  if (!data) return <div>Loading jobs...</div>;

  return (
    <ScrollArea className="h-[47vh] w-full rounded-md border">
      <Table className="w-full">
        <TableHeader className="bg-background z-10 [&_tr]:border-b"> 
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((job: Job) => (
            <TableRow
              key={job.id}
              className={`
                cursor-pointer hover:bg-muted/50 
                ${selectedJobId === job.id && "bg-muted pointer-events-none"}`}
              onClick={() => {
                router.push(`?job=${job.id}`, { scroll: false });
              }}
            >
              <TableCell title={job.title} className="max-w-[150px] truncate">
                {job.title}
              </TableCell>
              <TableCell title={job.company} className="max-w-[150px] truncate">
                {job.company}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass(
                    job.status
                  )}`}
                >
                  {job.status[0].toUpperCase() + job.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                {job.appliedAt
                  ? moment(job.appliedAt).local().format("MMM D, YYYY")
                  : "-"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/jobs/${job.id}`);
                  }}
                  className="pointer-events-auto"
                >
                  <Eye />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!confirm("Delete job?")) return;
                    await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
                    mutate(); // refresh list
                  }}
                  className="pointer-events-auto"
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default JobList;
