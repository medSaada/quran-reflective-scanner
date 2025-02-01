import { Camera, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

const CameraView = () => {
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Cleanup function to stop the camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleActivateCamera = async () => {
    try {
      setIsLoading(true);
      console.log('Starting camera activation...');
      
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser');
      }

      // Request camera access with specific constraints
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera permission granted, setting up video stream...');

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Set up video element with the stream
      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      // Wait for the video to be ready to play
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            resolve(true);
          };
        }
      });

      // Start playing the video
      await videoRef.current.play();
      console.log('Camera activated successfully');
      
      setIsActive(true);
      toast({
        title: "Camera activated",
        description: "You can now take a picture",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Failed to access camera",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        setIsPreview(true);
        
        // Stop the camera stream after capturing
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsActive(false);
      }
    }
  };

  const handleConfirmImage = () => {
    setIsPreview(false);
    setIsCropping(true);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsPreview(false);
    handleActivateCamera();
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass animate-fadeIn">
      {!isActive && !capturedImage && !isPreview ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleActivateCamera}
            className="p-6 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors animate-glow dark:bg-sage-900 dark:text-sage-100 disabled:opacity-50"
            disabled={isLoading}
          >
            <Camera className="w-8 h-8" />
          </button>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Activating camera..." : "Tap to activate camera"}
          </p>
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
      ) : isPreview && capturedImage ? (
        <div className="relative h-full">
          <img
            src={capturedImage}
            alt="Preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              onClick={handleRetake}
              variant="destructive"
            >
              Retake
            </Button>
            <Button
              onClick={handleConfirmImage}
              variant="default"
              className="bg-sage-600 hover:bg-sage-700"
            >
              Confirm
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
