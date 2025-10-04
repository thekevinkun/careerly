"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isValidAccess, setIsValidAccess] = useState(false);

  useEffect(() => {
    // Check if this page was opened in a popup context
    const isPopup = window.opener && !window.opener.closed;

    if (!isPopup) {
      // Direct access - redirect immediately
      router.replace("/account/profile");
      return;
    }

    setIsValidAccess(true);

    if (status === "authenticated" && session?.user) {
      // Notify parent window
      window.opener.postMessage(
        { type: "OAUTH_SUCCESS" },
        window.location.origin
      );
      
      setTimeout(() => {
        window.close();
      }, 100);
    }
  }, [status, session, router]);

  if (!isValidAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Connecting account...</p>
      </div>
    </div>
  );
}
