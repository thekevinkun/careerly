export interface Note {
    id: string;
    note: string;
    createdAt: string;
    jobId: string;
}

export interface NotesSectionProps {
    selectedJobId?: string | null;
}