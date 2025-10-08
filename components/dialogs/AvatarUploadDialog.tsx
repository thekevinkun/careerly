"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Area } from "react-easy-crop";
import { Camera, Trash2, ArrowLeft } from "lucide-react";
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
import AvatarCropper from "@/components/AvatarCropper";

import { AvatarUploadDialogProps } from "@/types/dialog";
import getCroppedImg from "@/lib/crop-image";

const AvatarUploadDialog = ({
  open,
  onOpenChange,
  currentAvatar,
  userName,
  onUploadSuccess,
}: AvatarUploadDialogProps) => {
  const { update: updateSession } = useSession();
  const [step, setStep] = useState<"select" | "crop" | "preview">("select");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPG, PNG, or WebP images.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setStep("crop");
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  };

  const handleApplyCrop = async () => {
    if (!originalImage || !croppedAreaPixels) return;

    setProcessing(true);
    setError(null);

    try {
      // Create cropped image
      const croppedImageBlob = await getCroppedImg(
        originalImage,
        croppedAreaPixels
      );

      // Create preview URL
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

      setCroppedImage(croppedImageUrl);
      setCroppedBlob(croppedImageBlob);
      setStep("preview");
    } catch (err: any) {
      console.error("Crop error:", err);
      setError(err.message || "Failed to crop image");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!croppedBlob) return;

    setUploading(true);
    setError(null);

    try {
      const croppedFile = new File(
        [croppedBlob],
        selectedFile?.name || "avatar.jpg",
        {
          type: "image/jpeg",
        }
      );

      const formData = new FormData();
      formData.append("avatar", croppedFile);

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
      console.error("Upload error:", err);
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
    setStep("select");
    setOriginalImage(null);
    setCroppedImage(null);
    setCroppedBlob(null);
    setSelectedFile(null);
    setCroppedAreaPixels(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Clean up blob URLs
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleBackFromCrop = () => {
    setStep("select");
    setOriginalImage(null);
    setSelectedFile(null);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBackFromPreview = () => {
    setStep("crop");
    setCroppedImage(null);
    setCroppedBlob(null);
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage);
    }
  };

  const handleChooseNewPhoto = () => {
    resetForm();
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(step === "crop" || step === "preview") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={
                  step === "crop" ? handleBackFromCrop : handleBackFromPreview
                }
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === "select" && "Change Avatar"}
            {step === "crop" && "Adjust Your Photo"}
            {step === "preview" && "Preview Avatar"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Upload a new profile picture. Max size 5MB."}
            {step === "crop" && "Drag to reposition, use sliders to adjust"}
            {step === "preview" && "Review your new avatar before saving"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === "select" && (
            <>
              <div className="flex justify-center">
                <Avatar
                  className="h-32 w-32"
                  key={currentAvatar || "no-avatar"}
                >
                  {currentAvatar ? (
                    <AvatarImage src={currentAvatar} alt={userName} />
                  ) : (
                    <AvatarFallback className="text-4xl">
                      {userName?.[0] ?? "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />

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

                {currentAvatar && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={uploading || deleting}
                  >
                    {deleting ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  • Recommended: Square images (400x400px or larger)
                  <br />
                  • Accepted formats: JPG, PNG, WebP
                  <br />• Maximum file size: 5MB
                </AlertDescription>
              </Alert>
            </>
          )}

          {step === "crop" && originalImage && (
            <AvatarCropper
              image={originalImage}
              onCropComplete={handleCropComplete}
            />
          )}

          {step === "preview" && (
            <>
              <div className="flex justify-center">
                <Avatar className="h-40 w-40 ring-4 ring-primary/20">
                  {croppedImage ? (
                    <AvatarImage src={croppedImage} alt="Preview" />
                  ) : (
                    <AvatarFallback className="text-4xl">
                      {userName?.[0] ?? "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  This is how your avatar will look
                </p>
                <p className="text-xs text-muted-foreground">
                  Happy with it? Click "Save Avatar" below
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleChooseNewPhoto}
                disabled={uploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Choose Different Photo
              </Button>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading || deleting || processing}
          >
            Cancel
          </Button>

          {step === "crop" && (
            <Button
              onClick={handleApplyCrop}
              disabled={processing || !croppedAreaPixels}
            >
              {processing ? "Processing..." : "Apply Crop"}
            </Button>
          )}

          {step === "preview" && (
            <Button onClick={handleUpload} disabled={uploading || !croppedBlob}>
              {uploading ? "Uploading..." : "Save Avatar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarUploadDialog;
