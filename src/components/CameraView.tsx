
import { useState } from "react";
import { type Crop } from 'react-image-crop';
import { CameraInitializer } from "./camera/CameraInitializer";
import { CameraPreview } from "./camera/CameraPreview";
import { ImagePreview } from "./camera/ImagePreview";
import { ImageCropper } from "./camera/ImageCropper";
import { useImageCropping } from "./camera/hooks/useImageCropping";

const CameraView = () => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    capturedImage,
    setCapturedImage,
    croppedImage,
    setCroppedImage,
    crop,
    setCrop,
    isCropping,
    setIsCropping,
    getCroppedImage
  } = useImageCropping();

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
    setCroppedImage(null);
    setIsPreview(false);
    setIsLoading(true);
  };

  const handleConfirmImage = () => {
    setIsPreview(false);
    setIsCropping(true);
  };

  const handleSaveCrop = async () => {
    if (capturedImage && crop) {
      try {
        console.log('Starting crop with data:', crop);
        const croppedImageUrl = await getCroppedImage(capturedImage, crop);
        console.log('Crop successful, setting cropped image');
        setCroppedImage(croppedImageUrl);
        setIsCropping(false);
        // Clear states after successful crop
        setCapturedImage(null);
        setCrop(undefined);
      } catch (error) {
        console.error('Error during crop:', error);
      }
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setCroppedImage(null);
    setIsCropping(false);
    setIsPreview(false);
    setIsActive(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass animate-fadeIn">
      {!isActive && !capturedImage && !isPreview && !croppedImage ? (
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
      ) : croppedImage ? (
        <ImagePreview
          imageUrl={croppedImage}
          onRetake={handleRetake}
          onConfirm={() => console.log('Processing cropped image:', croppedImage)}
        />
      ) : null}
    </div>
  );
};

export default CameraView;
