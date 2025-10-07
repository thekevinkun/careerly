"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Camera } from "lucide-react";

import { AvatarUploadDialogProps } from "@/types/dialog";

const AvatarUploadDialog = ({
  open,
  onOpenChange,
  currentAvatar,
  userName,
  onUploadSuccess,
}: AvatarUploadDialogProps) => {
  const { update: updateSession } = useSession();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // console.log("File: ", e.target.files);
    // console.log("Target File: ", file);

    setError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPG, PNG, or WebP images.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      //   console.log("Form data: ", formData);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      await updateSession();

      toast.success("Avatar updated successfully!");
      onUploadSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete avatar");
      }

      await updateSession();

      toast.success("Avatar removed successfully!");
      onUploadSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to delete avatar");
      toast.error(err.message || "Failed to delete avatar");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Avatar</DialogTitle>
          <DialogDescription>
            Upload a new profile picture. Max size 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current/Preview Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              {preview ? (
                <AvatarImage src={preview} alt="Preview" />
              ) : currentAvatar ? (
                <AvatarImage src={currentAvatar} alt={userName} />
              ) : (
                <AvatarFallback className="text-4xl">
                  {userName?.[0] ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || deleting}
            >
              <Camera className="h-4 w-4 mr-2" />
              Choose Photo
            </Button>

            {currentAvatar && !preview && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={uploading || deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              <p>Selected: {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <Alert>
            <AlertDescription className="text-xs">
              • Recommended: Square images (400x400px or larger)
              <br />
              • Accepted formats: JPG, PNG, WebP
              <br />• Maximum file size: 5MB
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading || deleting}
          >
            Cancel
          </Button>
          {preview && (
            <Button
              onClick={handleUpload}
              disabled={uploading || deleting || !selectedFile}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploadDialog;
