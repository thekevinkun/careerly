"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if it's a session error
    if (
      error.message.includes("session") ||
      error.message.includes("unauthorized")
    ) {
      error.message = "Your session has expired. Please log in again.";
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => router.push("/login")}>Back to Login</Button>
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
