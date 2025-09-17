export type JobStatus = "applied" | "interviewing" | "offer" | "rejected";

export interface Job {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  appliedAt?: string;
}
