"use client";

import useSWR from "swr";
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Job } from "@/types/job";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const JobList = () => {
  const { data, error, mutate } = useSWR<Job[]>("/api/jobs", fetcher);

  const router = useRouter();

  if (error) return <div className="text-destructive">Failed to load jobs</div>;
  if (!data) return <div>Loading jobs...</div>;

  const statusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-info text-info-foreground";
      case "interviewing":
        return "bg-warning text-warning-foreground";
      case "offer":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
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
            <TableRow key={job.id}>
              <TableCell>{job.title}</TableCell>
              <TableCell>{job.company}</TableCell>
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
                  onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("Delete job?")) return;
                    await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
                    mutate(); // refresh list
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobList;
