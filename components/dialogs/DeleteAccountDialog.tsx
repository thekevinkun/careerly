"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import { DeleteAccountDialogProps } from "@/types/dialog";

const DeleteAccountDialog = ({
  open,
  onOpenChange,
  hasPassword,
}: DeleteAccountDialogProps) => {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetForm = () => {
    setPassword("");
    setConfirmText("");
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleDelete = async () => {
    setError(null);

    // Validation
    if (hasPassword && !password) {
      setError("Please enter your password");
      return;
    }

    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" exactly to confirm');
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: hasPassword ? password : undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      console.error("Delete account error:", err);
      setError(err.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  if (!mounted) {
    return;
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-left space-y-2 text-sm text-muted-foreground">
              <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
              <p className="font-semibold">All of the following will be deleted:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your profile information</li>
                <li>All job applications</li>
                <li>All resumes and cover letters</li>
                <li>Your subscription plan</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={deleting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || confirmText !== "DELETE"}
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
