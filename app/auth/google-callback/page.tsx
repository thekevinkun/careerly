"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if opened in a popup
      if (window.opener && !window.opener.closed) {
        // Notify parent window of successful authentication
        window.opener.postMessage(
          { type: "GOOGLE_AUTH_SUCCESS" },
          window.location.origin
        );
        window.close();
      } else {
        // If not a popup, redirect normally
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}