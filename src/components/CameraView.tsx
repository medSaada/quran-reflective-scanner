import { useState } from "react";
import { type Crop } from 'react-image-crop';
import { CameraInitializer } from "./camera/CameraInitializer";
import { CameraPreview } from "./camera/CameraPreview";
import { ImagePreview } from "./camera/ImagePreview";
import { ImageCropper } from "./camera/ImageCropper";

const CameraView = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCameraReady = (newStream: MediaStream) => {
    setStream(newStream);
    setIsActive(true);
    setIsLoading(false);
  };

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsPreview(true);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsPreview(false);
    setIsLoading(true);
  };

  const handleConfirmImage = () => {
    setIsPreview(false);
    setIsCropping(true);
  };

  const handleSaveCrop = () => {
    if (capturedImage && crop) {
      const image = new Image();
      image.src = capturedImage;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = crop.width;
      canvas.height = crop.height;
      
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      
      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      console.log('Cropped image:', croppedImageUrl);
      
      // Reset states
      setCapturedImage(null);
      setIsCropping(false);
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsCropping(false);
    setIsPreview(false);
    setIsActive(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass animate-fadeIn">
      {!isActive && !capturedImage && !isPreview ? (
        <CameraInitializer
          onCameraReady={handleCameraReady}
          isLoading={isLoading}
        />
      ) : isActive && stream ? (
        <CameraPreview
          stream={stream}
          onCapture={handleCapture}
        />
      ) : isPreview && capturedImage ? (
        <ImagePreview
          imageUrl={capturedImage}
          onRetake={handleRetake}
          onConfirm={handleConfirmImage}
        />
      ) : capturedImage && isCropping ? (
        <ImageCropper
          imageUrl={capturedImage}
          crop={crop}
          onCropChange={setCrop}
          onSave={handleSaveCrop}
          onReset={handleReset}
        />
      ) : null}
    </div>
  );
};

export default CameraView;