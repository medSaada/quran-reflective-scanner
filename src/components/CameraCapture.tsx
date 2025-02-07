
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Language } from "@/types/language";
import { ImagePreview } from "./camera/ImagePreview";
import { ImageCropper } from "./camera/ImageCropper";
import { CameraPermissionDenied } from "./camera/CameraPermissionDenied";
import { useCamera } from "./camera/hooks/useCamera";
import { useImageProcessing } from "./camera/hooks/useImageProcessing";
import { useImageCropping } from "./camera/hooks/useImageCropping";
import { useNavigate } from "react-router-dom";

interface CameraCaptureProps {
  selectedLanguage: Language;
}

const CameraCapture = ({ selectedLanguage }: CameraCaptureProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error: cameraError, permissionState, initializeCamera } = useCamera();
  const { isLoading, error: processingError, extractedText, processImage } = useImageProcessing();
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

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        setIsCropping(true);
      }
    }
  };

  const handleConfirmCrop = async () => {
    if (capturedImage && crop) {
      try {
        console.log('Starting crop with data:', crop);
        const croppedImageUrl = await getCroppedImage(capturedImage, crop);
        console.log('Crop successful, setting cropped image');
        setCroppedImage(croppedImageUrl);
        setIsCropping(false);
      } catch (error) {
        console.error('Error during crop:', error);
      }
    }
  };

  const handleConfirmImage = async () => {
    if (croppedImage) {
      try {
        await processImage(croppedImage);
        navigate("/waiting", { 
          state: { 
            ayahText: extractedText,
            language: selectedLanguage 
          }
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  };

  const retakeImage = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCapturedImage(null);
    setCroppedImage(null);
    setIsCropping(false);
    setCrop(undefined);
    initializeCamera();
  };

  if (permissionState === "denied") {
    return <CameraPermissionDenied />;
  }

  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto glass p-6 rounded-xl animate-fadeIn">
      {!capturedImage ? (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-sage-900/90 to-sage-800/90 shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover mix-blend-overlay"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
            <Button
              onClick={captureImage}
              size="icon"
              className="rounded-full w-12 h-12 bg-white/90 hover:bg-white/100 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-sage-300/50"
              disabled={isLoading || !stream}
            >
              <Camera className="w-5 h-5 text-sage-800" />
            </Button>
          </div>
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
            {selectedLanguage}
          </div>
        </div>
      ) : isCropping ? (
        <ImageCropper
          imageUrl={capturedImage}
          crop={crop}
          onCropChange={setCrop}
          onSave={handleConfirmCrop}
          onReset={retakeImage}
        />
      ) : (
        <ImagePreview
          imageUrl={croppedImage || capturedImage}
          onRetake={retakeImage}
          onConfirm={handleConfirmImage}
        />
      )}

      {(cameraError || processingError) && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive animate-shake">
          {cameraError || processingError}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
