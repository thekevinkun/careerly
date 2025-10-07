import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Clipboard, Download, Trash2 } from "lucide-react";

import { CoverLetterCardProps } from "@/types/job";
import { downloadTextFile } from "@/lib/helpers";

const CoverLetterCard = ({ coverLetter, index, mutate }: CoverLetterCardProps) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000); // reset after 5s
  };

  const handleDelete = async () => {
    if (!confirm("Delete this coverLetter?")) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/coverLetters/${coverLetter.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Something went wrong. Failed to delete cover letter.");
      
      toast.success("Successfully deleted resume.");
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mt-5">
      <Card key={coverLetter.id} className="bg-white-card w-full p-4 shadow-sm relative">
        {/* Content */}
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <ReactMarkdown>{coverLetter.content}</ReactMarkdown>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-0.5 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          disabled={copied}
        >
          {copied ? (
            <span className="text-xs font-medium">✔</span>
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            downloadTextFile(
              coverLetter.content,
              `coverLetter-${index + 1}.txt`
            )
          }
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={deleting}
          className="text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          {deleting ? (
            <span className="text-xs font-medium">...</span>
          ) : (
            <Trash2 className="w-4 h-4" />  
          )}
        </Button>
      </div>
    </div>
  );
};

export default CoverLetterCard;
