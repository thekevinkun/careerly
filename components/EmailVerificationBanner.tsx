"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";

import { EmailVerificationBannerProps } from "@/types/globals";

const EmailVerificationBanner = ({
  email,
  emailVerified,
}: EmailVerificationBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (emailVerified || dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        alert("Verification email sent! Please check your inbox.");
      } else {
        alert("Failed to send email. Please try again later.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Alert className="relative">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Please verify your email address. Check your inbox for the
          verification link.
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;
