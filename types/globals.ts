export type JobStatus = "applied" | "interviewing" | "offer" | "rejected" | "total";

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

export interface JobListProps {
  data?: Job[];
  error?: any;
  isLoading?: boolean;
  selectedJobId?: string | null;
}

export interface AiResultDialogProps {
  selectedJobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: { resume?: string | null; coverLetter?: string | null; isAiGenerated: boolean } | null;
  mutate?: () => void;
}

export interface ResumeCardProps {
  resume: ResumeVersion;
  index: number;
  mutate: () => void;
}

export interface CoverLetterCardProps {
  coverLetter: CoverLetter;
  index: number;
  mutate: () => void;
}

export type OAuthProvider = "google" | "github" | "linkedin";

export interface EmailVerificationBannerProps {
  email: string;
  emailVerified: boolean;
}

export interface ProfileDTO {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  linkedinUrl?: string | null;
  githubUsername?: string | null;
  createdAt: string;
  lastLogin?: string | null;

  connectedProviders: OAuthProvider[];
  accounts?: { provider: string; providerAccountId: string }[];
};

export interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPassword: boolean;
}