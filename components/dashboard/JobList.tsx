"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import moment from "moment";

import { Eye, Pencil, Check, Trash2, X } from "lucide-react";

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
  const { data, error } = useSWR<Job[]>("/api/jobs", fetcher);
  const { mutate } = useSWRConfig();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    title: string;
    company: string;
    status: string;
  }>({ title: "", company: "", status: "applied" });

  if (error) return <div className="text-destructive">Failed to load jobs</div>;
  if (!data)
    return <p className="text-emerald-600 animate-pulse">Loading jobs...</p>;

  const handleSave = async (jobId: string) => {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    setEditingId(null);
    await mutate("/api/jobs"); // refersh list of jobs
    await mutate("/api/jobs/status-summary"); // refersh chart
  }

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ title: "", company: "", status: "applied" });
  }

  return (
    <ScrollArea className="h-[47vh] w-full rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm border-b">
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((job: Job) => {
            const isEditing = editingId === job.id;
            return (
              <TableRow
                key={job.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedJobId === job.id && "bg-muted pointer-events-none"
                }`}
                onClick={() => {
                  if (!isEditing) {
                    router.push(`?job=${job.id}`, { scroll: false });
                  }
                }}
              >
                {/* Title */}
                <TableCell className="max-w-[150px] truncate">
                  {isEditing ? (
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={editValues.title}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    job.title
                  )}
                </TableCell>

                {/* Company */}
                <TableCell className="max-w-[150px] truncate">
                  {isEditing ? (
                    <input
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={editValues.company}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    job.company
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {isEditing ? (
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={editValues.status}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass(
                        job.status
                      )}`}
                    >
                      {job.status[0].toUpperCase() + job.status.slice(1)}
                    </span>
                  )}
                </TableCell>

                {/* Applied Date */}
                <TableCell>
                  {job.appliedAt
                    ? moment(job.appliedAt).local().format("MMM D, YYYY")
                    : "-"}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-center space-x-2 pointer-events-auto">
                  {isEditing ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleSave(job.id);
                        }}
                      >
                        <Check />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                      >
                        <X />
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Delete job?")) return;
                          await fetch(`/api/jobs/${job.id}`, {
                            method: "DELETE",
                          });
                          await mutate("/api/jobs"); // refersh list of jobs
                          await mutate("/api/jobs/status-summary"); // refersh chart
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/jobs/${job.id}`);
                        }}
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(job.id);
                          setEditValues({
                            title: job.title,
                            company: job.company,
                            status: job.status,
                          });
                        }}
                      >
                        <Pencil />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default JobList;
