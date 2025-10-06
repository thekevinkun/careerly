"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import AiResultDialog from "@/components/modals/AiResultDialog";
import ResumeCard from "./ResumeCard";
import CoverLetterCard from "./CoverLetterCard";

import { Pencil, Trash2, Check, X, Sparkles } from "lucide-react";

import { Job } from "@/types/globals";
import { fetcher, statusClass } from "@/lib/helpers";

const JobDetail = ({ jobId }: { jobId: string }) => {
  const {
    data: job,
    error,
    isLoading,
    mutate,
  } = useSWR<Job>(`/api/jobs/${jobId}`, fetcher);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [loadingAiGenerateResume, setLoadingAiGenerateResume] = useState(false);
  const [loadingAiGenerateCoverLetter, setLoadingAiGenerateCoverLetter] =
    useState(false);
  const [aiResult, setAiResult] = useState<{
    resume?: string | null;
    coverLetter?: string | null;
    isAiGenerated: boolean;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  if (!job) {
    return (
      <div className="h-full flex-center text-muted-foreground">
        No job exists with this ID.
      </div>
    );
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !jobId) return;

    setLoading(true);
    const res = await fetch(`/api/jobs/${jobId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Successfully added note.");
      setNewNote("");
      setEditingField(null);
      mutate();
    } else {
      toast.error("Failed to add note. Try again later.");
    }
  };

  // Handle save
  const handleSave = async (field: string) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: editValues[field] }),
    });

    if (res.ok) {
      toast.success("Successfully updated job.");
      setEditingField(null);
      mutate();
    } else {
      toast.error("Something went wrong. Failed to update your job.");
    }
  };

  const handleGenerateResumeWithAI = async () => {
    if (!jobId) return;
    setLoadingAiGenerateResume(true);

    try {
      // call resume API
      const resumeRes = await fetch(`/api/jobs/${jobId}/resume-generate`, {
        method: "POST",
      });

      if (!resumeRes.ok) throw new Error("Something went wrong. Failed to generate resume.");
      const resumeData = await resumeRes.json();

      setAiResult({
        resume: resumeData.resume,
        coverLetter: null,
        isAiGenerated: resumeData.isAiGenerated,
      });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again later.");
    } finally {
      setLoadingAiGenerateResume(false);
    }
  };

  const handleGenerateCoverLetterWithAI = async () => {
    if (!jobId) return;
    setLoadingAiGenerateCoverLetter(true);

    try {
      // call cover letter API
      const coverRes = await fetch(`/api/jobs/${jobId}/cover-letter-generate`, {
        method: "POST",
      });
      if (!coverRes.ok) throw new Error("Something went wrong. Failed to generate cover letter.");
      const coverData = await coverRes.json();

      setAiResult({
        resume: null,
        coverLetter: coverData.coverLetter,
        isAiGenerated: coverData.isAiGenerated,
      });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again later.");
    } finally {
      setLoadingAiGenerateCoverLetter(false);
    }
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className="px-4 py-6 lg:p-6 flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            {editingField === "title" ? (
              <div className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 text-xl font-bold text-primary"
                  value={editValues.title ?? job.title}
                  onChange={(e) =>
                    setEditValues((prev: any) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <Button
                  size="icon"
                  variant="default"
                  onClick={async () => {
                    await handleSave("title"); // your save function
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditingField(null);
                    setEditValues({});
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                {job.title}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingField("title");
                    setEditValues({ title: job.title });
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardTitle>
            )}

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
                Applied
                {job.appliedAt ? format(new Date(job.appliedAt), "dd MMMM yyyy HH:mm") : "-"}
              </span>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary">Description</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingField("description");
                    setEditValues({ description: job.description });
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              {editingField === "description" ? (
                <div className="flex gap-2 mt-2">
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows={4}
                    value={editValues.description ?? job.description}
                    onChange={(e) =>
                      setEditValues((prev: any) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      size="icon"
                      variant="default"
                      onClick={() => handleSave("description")}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setEditingField(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {job.description || "No description provided."}
                </p>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary">Notes</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingField("notes");
                    setEditValues({
                      notes: job.notes.map((n) => n.note).join("\n"),
                    });
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>

              {!job.notes || job.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No notes added.
                </p>
              ) : (
                <div className="mt-3">
                  <ul className="space-y-3">
                    {job.notes?.map((note) => (
                      <li key={note.id} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />

                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {note.note}
                          </p>

                          <div className="flex items-center">
                            <span className="text-end text-xs text-muted-foreground">
                              {format(new Date(note.createdAt), "MMM D, YYYY")}
                            </span>
                          </div>
                        </div>

                        {editingField === "notes" && (
                          <div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (!confirm("Delete this note?")) return;
                                await fetch(
                                  `/api/jobs/${jobId}/notes/${note.id}`,
                                  { method: "DELETE" }
                                );
                                mutate(); // refresh list
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {editingField === "notes" && (
                <div className="mt-4 flex items-center gap-2">
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a note..."
                  />
                  <Button onClick={handleAddNote} disabled={loading}>
                    Add
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Resumes */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary">Resumes</h3>

                {!job.resumes ||
                  (job.resumes.length === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingAiGenerateResume}
                      onClick={handleGenerateResumeWithAI}
                    >
                      {loadingAiGenerateResume ? (
                        "Generating..."
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Generate with AI
                        </>
                      )}
                    </Button>
                  ))}
              </div>
              {job.resumes && job.resumes.length > 0 ? (
                job.resumes.map((r) => (
                  <ResumeCard
                    key={r.id}
                    resume={r}
                    index={job.resumes.indexOf(r)}
                    mutate={mutate}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2">
                  No AI-generated resumes yet.
                </p>
              )}
            </div>

            <Separator />

            {/* Cover Letters */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary">Cover Letters</h3>

                {!job.coverLetters ||
                  (job.coverLetters.length === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingAiGenerateCoverLetter}
                      onClick={handleGenerateCoverLetterWithAI}
                    >
                      {loadingAiGenerateCoverLetter ? (
                        "Generating..."
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Generate with AI
                        </>
                      )}
                    </Button>
                  ))}
              </div>
              {job.coverLetters && job.coverLetters.length > 0 ? (
                job.coverLetters.map((c) => (
                  <CoverLetterCard
                    key={c.id}
                    coverLetter={c}
                    index={job.coverLetters.indexOf(c)}
                    mutate={mutate}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2">
                  No AI-generated cover letters yet.
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
            </div>
          </CardContent>
        </Card>

        <AiResultDialog
          selectedJobId={jobId || null}
          open={showModal}
          onOpenChange={setShowModal}
          aiResult={aiResult}
          mutate={mutate}
        />
      </div>
    </ScrollArea>
  );
};

export default JobDetail;
