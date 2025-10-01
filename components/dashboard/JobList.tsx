"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import moment from "moment";

import { Eye, Pencil, Check, Trash2, X } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Job, JobListProps } from "@/types/globals";
import { statusClass } from "@/lib/helpers";

const JobList = ({ data, error, isLoading, selectedJobId }: JobListProps) => {
  const { mutate } = useSWRConfig();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    title: string;
    company: string;
    status: string;
  }>({ title: "", company: "", status: "applied" });

  if (error) return <div className="text-destructive">Failed to load jobs</div>;
  if (isLoading)
    return (
      <p className="min-h-[55vh] md:min-h-full w-full flex-center text-primary animate-pulse">
        Loading jobs...
      </p>
    );
  if (!data || data.length === 0)
    return (
      <div className="text-muted-foreground">
        No jobs yet. Add a job to get started!
      </div>
    );

  const handleSave = async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });

    if (res.ok) {
      toast.success("Successfully updated job.");
      setEditingId(null);
      await mutate("/api/jobs"); // refersh list of jobs
      await mutate("/api/jobs/status-summary"); // refersh chart
    } else {
      toast.error("Something went wrong. Failed to update your job.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ title: "", company: "", status: "applied" });
  };

  return (
    <div className="h-full md:h-full w-full overflow-hidden">
      <div className="hidden md:block sticky top-0 bg-white/90 backdrop-blur-sm z-10 md:shadow-sm">
        <div
          className="grid grid-cols-1 md:grid-cols-5 
          lg:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(125px,1fr)_minmax(90px,1fr)_minmax(120px,1fr)]
          gap-x-2 md:gap-x-3 lg:gap-x-2 items-center font-medium py-2 px-0 md:px-4 text-sm"
        >
          <div className="hidden md:block text-foreground">Title</div>
          <div className="hidden md:block text-foreground">Company</div>
          <div className="hidden md:block text-foreground">Status</div>
          <div className="hidden md:block text-foreground">Applied</div>
          <div className="hidden md:block text-foreground text-right"></div>
        </div>
      </div>

      <ScrollArea className="h-[55vh] md:h-[45vh] w-full">
        <div className="min-w-full sm:min-w-[600px] pr-3 md:pr-0">
          {data.map((job: Job) => {
            const isEditing = editingId === job.id;
            return (
              <div
                key={job.id}
                className={`text-sm grid grid-cols-1 md:grid-cols-5 
                  lg:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(125px,1fr)_minmax(90px,1fr)_minmax(120px,1fr)] 
                  gap-x-2 md:gap-x-3 lg:gap-x-2 items-start md:items-center py-2.75 px-0 md:px-4
                  cursor-pointer hover:md:bg-muted/50 md:border-b last:border-b-0
                  pointer-events-none md:pointer-events-auto
                  
                  ${
                    selectedJobId === job.id && "bg-muted !pointer-events-none"
                  }`}
                onClick={() => {
                  if (!isEditing) {
                    router.push(`?job=${job.id}`, { scroll: false });
                  }
                }}
              >
                <div className="bg-white-card md:bg-muted/20 md:hidden mb-0 md:mb-2 p-4 md:p-2 md:rounded">
                  <div className="font-medium mb-1">
                    {isEditing ? (
                      <input
                        className="w-full border rounded px-2 py-1 text-sm mb-1"
                        placeholder="Title"
                        value={editValues.title}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <div className="truncate">{job.title}</div>
                    )}
                    {isEditing ? (
                      <input
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="Company"
                        value={editValues.company}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs truncate">
                        {job.company}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="flex-1 min-w-[120px]">
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
                    </div>
                    <div className="flex-1 min-w-[100px] text-right">
                      {job.appliedAt
                        ? moment(job.appliedAt).local().format("MMM D, YYYY")
                        : "-"}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 !pointer-events-none">
                    {isEditing ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleSave(job.id);
                          }}
                          className="!pointer-events-auto"
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
                          className="!pointer-events-auto"
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
                            await mutate("/api/jobs");
                            await mutate("/api/jobs/status-summary");
                          }}
                          className="!pointer-events-auto"
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
                          className="!pointer-events-auto"
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
                          className="!pointer-events-auto"
                        >
                          <Pencil />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="hidden md:block truncate">
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
                </div>

                <div className="hidden md:block truncate">
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
                </div>

                <div className="hidden md:block">
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
                </div>

                <div className="hidden md:block">
                  {job.appliedAt
                    ? moment(job.appliedAt).local().format("MMM D, YYYY")
                    : "-"}
                </div>

                <div className="hidden md:block text-right space-x-1 !pointer-events-none">
                  {isEditing ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleSave(job.id);
                        }}
                        className="!pointer-events-auto"
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
                        className="!pointer-events-auto"
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
                          await mutate("/api/jobs");
                          await mutate("/api/jobs/status-summary");
                        }}
                        className="!pointer-events-auto"
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
                        className="!pointer-events-auto"
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
                        className="!pointer-events-auto"
                      >
                        <Pencil />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default JobList;
