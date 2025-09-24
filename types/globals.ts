export type JobStatus = "applied" | "interviewing" | "offer" | "rejected";

export interface ApplicationNote {
  id: string;
  note: string;
  createdAt: string;
  jobId: string;
}

export interface ResumeVersion {
  id: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export interface CoverLetter {
  id: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  jobLink?: string;
  appliedAt?: string;
  status: JobStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  notes: ApplicationNote[];
  resumes: ResumeVersion[];
  coverLetters: CoverLetter[];
}

export interface AiResultDialogProps {
  selectedJobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: { resume: string; coverLetter: string; isAiGenerated: boolean } | null;
  onSave: () => void;
}