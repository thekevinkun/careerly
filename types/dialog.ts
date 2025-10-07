export interface AiResultDialogProps {
  selectedJobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiResult: { resume?: string | null; coverLetter?: string | null; isAiGenerated: boolean } | null;
  mutate?: () => void;
}

export interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPassword: boolean;
}
