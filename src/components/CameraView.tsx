import { Camera, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "./ui/button";

const CameraView = () => {
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleActivateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        setIsCropping(true); // Immediately show cropping interface after capture
        
        // Stop the camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsActive(false); // Hide camera view
      }
    }
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
    setIsActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass animate-fadeIn">
      {!isActive && !capturedImage ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleActivateCamera}
            className="p-6 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors animate-glow dark:bg-sage-900 dark:text-sage-100"
          >
            <Camera className="w-8 h-8" />
          </button>
          <p className="text-sm text-muted-foreground">Tap to activate camera</p>
        </div>
      ) : isActive ? (
        <div className="relative h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              onClick={handleCapture}
              variant="secondary"
              className="rounded-full w-12 h-12 p-0 bg-white/80"
            >
              <div className="w-8 h-8 rounded-full border-2 border-sage-600" />
            </Button>
          </div>
        </div>
      ) : capturedImage && isCropping ? (
        <div className="relative h-full">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            className="h-full"
          >
            <img
              src={capturedImage}
              alt="Captured"
              className="max-h-full w-full object-contain"
            />
          </ReactCrop>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleReset}
              variant="destructive"
              size="icon"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSaveCrop}
              variant="default"
              className="bg-sage-600 hover:bg-sage-700"
            >
              Save Crop
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CameraView;