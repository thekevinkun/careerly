export const openOAuthPopup = async (
  provider: "google" | "github" | "linkedin",
  callbackUrl: string,
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  try {
    // Get CSRF token
    const csrfResponse = await fetch("/api/auth/csrf");
    const { csrfToken } = await csrfResponse.json();

    // Create popup window
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const authUrl = `/api/auth/signin/${provider}?${new URLSearchParams({
      callbackUrl,
      csrf: "true",
    })}`;

    const popup = window.open(
      "about:blank",
      `${provider} Sign In`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      onError("Popup blocked. Please allow popups for this site.");
      return;
    }

    // Submit form in popup
    const form = popup.document.createElement("form");
    form.method = "POST";
    form.action = authUrl;

    const csrfInput = popup.document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = popup.document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    callbackInput.value = callbackUrl;
    form.appendChild(callbackInput);

    popup.document.body.appendChild(form);
    form.submit();

    // Listen for success message
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "OAUTH_SUCCESS") {
        popup.close();
        window.removeEventListener("message", handleMessage);
        clearInterval(checkPopup);
        onSuccess();
      }
    };

    window.addEventListener("message", handleMessage);

    // Poll for popup close
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        window.removeEventListener("message", handleMessage);

        // Check session after popup closes
        fetch("/api/auth/session")
          .then((res) => res.json())
          .then((session) => {
            if (session?.user) {
              onSuccess();
            }
          })
          .catch(() => {
            onError("Authentication failed. Please try again.");
          });
      }
    }, 500);

    // Timeout after 2 minutes
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close();
      }
      clearInterval(checkPopup);
      window.removeEventListener("message", handleMessage);
    }, 120000);
  } catch (err) {
    onError(`Failed to initiate ${provider} sign-in. Please try again.`);
  }
};
