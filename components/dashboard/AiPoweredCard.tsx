"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import AiResultDialog from "../modals/AiResultDialog";

const AiPoweredCard = ({
  isLoading,
  selectedJobId,
}: {
  isLoading?: boolean;
  selectedJobId?: string | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    resume: string;
    coverLetter: string;
    isAiGenerated: boolean;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    if (!selectedJobId) return;
    setLoading(true);

    try {
      // call resume API
      const resumeRes = await fetch(
        `/api/jobs/${selectedJobId}/resume-generate`,
        {
          method: "POST",
        }
      );
      if (!resumeRes.ok) throw new Error("Failed to generate resume");
      const resumeData = await resumeRes.json();

      // call cover letter API
      const coverRes = await fetch(
        `/api/jobs/${selectedJobId}/cover-letter-generate`,
        {
          method: "POST",
        }
      );
      if (!coverRes.ok) throw new Error("Failed to generate cover letter");
      const coverData = await coverRes.json();

      setAiResult({
        resume: resumeData.resume,
        coverLetter: coverData.coverLetter,
        isAiGenerated: resumeData.isAiGenerated && coverData.isAiGenerated,
      });
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong generating suggestions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        className={`min-h-[192px] lg:min-h-auto !pt-3 !pb-5 !px-0 bg-ai-card 
            ${isLoading && "animate-pulse"}`}
      >
        {!isLoading && (
          <>
            <CardHeader>
              <Image
                src="/icons/glitter-sparkle.svg"
                alt="AI Glitter Sparkle Icons"
                width={38}
                height={38}
                className="animate-pulse"
              />
              <CardTitle className="pt-0.5 text-primary-foreground">
                AI-Powered Resume & Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col mt-auto gap-3">
              {!selectedJobId ? (
                <p className="text-sm text-primary-foreground italic">
                  Select a job from the list to generate
                </p>
              ) : (
                <p className="text-sm text-primary-foreground italic">
                  Ready to generate
                </p>
              )}

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGenerate}
                disabled={!selectedJobId || loading}
              >
                {loading ? "Generating..." : "Generate Suggestions"}
              </Button>
            </CardContent>
          </>
        )}
      </Card>

      {/* AI Result Dialog */}
      <AiResultDialog
        selectedJobId={selectedJobId || null}
        open={showModal}
        onOpenChange={setShowModal}
        aiResult={aiResult}
      />
    </>
  );
};

export default AiPoweredCard;
