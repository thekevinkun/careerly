"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import useSWR from "swr";

const SuggestionsModal = ({
  jobId,
  children,
}: {
  jobId: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useSWR(
    open ? `/api/jobs/${jobId}/suggestions` : null,
    (url) => fetch(url).then((r) => r.json())
  );

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Suggestions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {isLoading && <p>Loading...</p>}
            {data?.suggestions?.map((s: string, i: number) => (
              <p key={i} className="text-sm bg-muted p-2 rounded">
                {s}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuggestionsModal;
