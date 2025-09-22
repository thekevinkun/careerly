"use client";

import useSWR from "swr";
import moment from "moment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import SuggestionsModal from "@/components/jobs/SuggestionsModal";

import { Trash2, Sparkles } from "lucide-react";
import { Job } from "@/types/job";
import { fetcher, statusClass } from "@/lib/helpers";

const JobDetail = ({ jobId }: { jobId: string }) => {
  const {
    data: job,
    error,
    isLoading,
    mutate,
  } = useSWR<Job>(`/api/jobs/${jobId}`, fetcher);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-center h-full">
        <p className="text-primary animate-pulse">Loading job details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex-center text-destructive">
        {error.status === 401 && <p>Please log in to view this job.</p>}
        {error.status === 403 && <p>You don’t own this job.</p>}
        {!error.status && <p>Something went wrong loading this job.</p>}
      </div>
    );
  }

  // No job
  if (!job) {
    return (
      <div className="h-full flex-center text-muted-foreground">
        No job exists with this ID.
      </div>
    );
  }

  // Job content
  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6 flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              {job.title}
            </CardTitle>
            <p className="text-muted-foreground">{job.company}</p>
            {job.jobLink && (
              <a
                href={job.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline hover:no-underline w-fit"
              >
                View Job Posting
              </a>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status + Applied date */}
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(
                  job.status
                )}`}
              >
                {job.status[0].toUpperCase() + job.status.slice(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                Applied {moment(job.appliedAt).local().format("DD MMMM YYYY HH:mm")}
              </span>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold text-primary mb-1">
                Description
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {job.description || "No description provided."}
              </p>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <h3 className="font-semibold text-primary mb-1">Notes</h3>
              {job.notes && job.notes.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {job.notes.map((n) => (
                    <li key={n.id}>{n.note}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No notes added.
                </p>
              )}
            </div>

            <Separator />

            {/* Resumes */}
            <div>
              <h3 className="font-semibold text-primary mb-1">Resumes</h3>
              {job.resumes && job.resumes.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {job.resumes.map((r) => (
                    <li key={r.id}>
                      {r.isAiGenerated ? "🤖 AI" : "📝"}{" "}
                      {r.content.slice(0, 50)}...
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No resumes uploaded.
                </p>
              )}
            </div>

            <Separator />

            {/* Cover Letters */}
            <div>
              <h3 className="font-semibold text-primary mb-1">
                Cover Letters
              </h3>
              {job.coverLetters && job.coverLetters.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {job.coverLetters.map((c) => (
                    <li key={c.id}>
                      {c.isAiGenerated ? "🤖 AI" : "✉️"}{" "}
                      {c.content.slice(0, 50)}...
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No cover letters uploaded.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-6">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Delete this job?")) return;
                  await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
                  mutate();
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>

              <SuggestionsModal jobId={job.id}>
                <Button
                  variant="outline"
                  className="border-primary text-primary"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Suggestions
                </Button>
              </SuggestionsModal>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default JobDetail;
