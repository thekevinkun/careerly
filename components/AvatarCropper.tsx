"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface AvatarCropperProps {
  image: string;
  onCropComplete: (croppedAreaPixels: Area) => void;
}

const AvatarCropper = ({ image, onCropComplete }: AvatarCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels);
    },
    [onCropComplete]
  );

  return (
    <div className="space-y-4">
      {/* Crop Area */}
      <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1} // Square crop (1:1 ratio)
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropCompleteCallback}
        />
      </div>

      {/* Zoom Control */}
      <div className="space-y-2">
        <Label className="text-xs">Zoom</Label>
        <Slider
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          min={1}
          max={3}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Rotation Control */}
      <div className="space-y-2">
        <Label className="text-xs">Rotation</Label>
        <Slider
          value={[rotation]}
          onValueChange={(value) => setRotation(value[0])}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Drag to reposition • Pinch or scroll to zoom • Adjust rotation
      </p>
    </div>
  )
}

export default AvatarCropper