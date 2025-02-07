
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera, RotateCcw, Check, X } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Language } from "@/types/language";
import { ExtractedText } from "@/types/api";

interface CameraCaptureProps {
  selectedLanguage: Language;
}

const CameraCapture = ({ selectedLanguage }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt");
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkCameraPermission();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionState(result.state);
      
      result.addEventListener('change', () => {
        setPermissionState(result.state);
      });

      if (result.state === 'granted') {
        initializeCamera();
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setError("Failed to check camera permissions");
    }
  };

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setError(null);
      toast({
        title: "Camera activated",
        description: "You can now capture images",
      });
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError("Failed to access camera");
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
      });
    }
  };

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

  const getCroppedImage = (sourceImage: string, cropData: Crop): Promise<string> => {
    return new Promise((resolve) => {
      const image = new Image();
      
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }

        // Wait for next frame to ensure image is rendered
        requestAnimationFrame(() => {
          // Find the actual displayed image element
          const displayedImage = document.querySelector('.ReactCrop__image');
          if (!displayedImage || !(displayedImage instanceof HTMLImageElement)) {
            console.error('Could not find displayed image element');
            resolve(sourceImage); // Fallback to original
            return;
          }

          // Get the actual displayed dimensions
          const displayWidth = displayedImage.clientWidth;
          const displayHeight = displayedImage.clientHeight;

          console.log('Dimensions:', {
            natural: {
              width: image.naturalWidth,
              height: image.naturalHeight
            },
            display: {
              width: displayWidth,
              height: displayHeight
            },
            crop: cropData
          });

          // Calculate scaling factors based on displayed vs natural dimensions
          const scaleX = image.naturalWidth / displayWidth;
          const scaleY = image.naturalHeight / displayHeight;

          // Scale the crop coordinates
          const scaledCrop = {
            x: Math.round(cropData.x * scaleX),
            y: Math.round(cropData.y * scaleY),
            width: Math.round(cropData.width * scaleX),
            height: Math.round(cropData.height * scaleY)
          };

          console.log('Scaled crop:', {
            original: cropData,
            scaled: scaledCrop,
            scale: { x: scaleX, y: scaleY }
          });

          // Set canvas dimensions to match the crop size
          canvas.width = scaledCrop.width;
          canvas.height = scaledCrop.height;

          // Enable high quality rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Clear canvas and ensure proper background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the cropped portion
          ctx.drawImage(
            image,
            scaledCrop.x,
            scaledCrop.y,
            scaledCrop.width,
            scaledCrop.height,
            0,
            0,
            scaledCrop.width,
            scaledCrop.height
          );

          const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
          resolve(croppedImageUrl);
        });
      };

      image.onerror = () => {
        console.error('Failed to load image for cropping');
        resolve(sourceImage);
      };

      image.crossOrigin = 'anonymous';
      image.src = sourceImage;
    });
  };

  const handleConfirmCrop = async () => {
    if (capturedImage && crop) {
      try {
        console.log('Starting crop with data:', crop);
        const croppedImageUrl = await getCroppedImage(capturedImage, crop);
        console.log('Crop successful, setting cropped image');
        setCroppedImage(croppedImageUrl);
        setIsCropping(false);
        processImage(croppedImageUrl);
      } catch (error) {
        console.error('Error during crop:', error);
        toast({
          variant: "destructive",
          title: "Cropping Error",
          description: "Failed to crop image. Please try again.",
        });
      }
    }
  };

  const retakeImage = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCapturedImage(null);
    setCroppedImage(null);
    setExtractedText("");
    setError(null);
    setIsCropping(false);
    setCrop(undefined);
    initializeCamera(); // Re-initialize the camera
  };

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const base64Data = imageDataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      
      console.log('Sending request to API...');
      const apiResponse = await axios.post<ExtractedText>(
        'http://127.0.0.1:8000/process-image/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: controller.signal
        }
      );
      
      console.log('API Response:', apiResponse.data);
      setExtractedText(apiResponse.data.text);
      toast({
        title: "Success",
        description: "Text extracted successfully",
      });
    } catch (err) {
      console.error('API error:', err);
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        setError("Request timed out. Please try again.");
      } else {
        setError("Failed to process image");
      }
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to extract text from image",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  if (permissionState === "denied") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 glass rounded-xl text-center">
        <p className="text-destructive font-medium">Camera access was denied</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Request Permission Again
        </Button>
      </div>
    );
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
        <div className="space-y-4 animate-fadeIn">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            className="rounded-lg overflow-hidden bg-black/90 shadow-xl"
          >
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </ReactCrop>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={retakeImage}
              className="flex items-center gap-2 hover:bg-sage-100 dark:hover:bg-sage-900"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              onClick={handleConfirmCrop}
              className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700"
              disabled={!crop}
            >
              <Check className="w-4 h-4" />
              Confirm Crop
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
            <img
              src={croppedImage || capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                onClick={retakeImage}
                className="flex items-center gap-2 bg-white/90 hover:bg-white/100 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 p-6 animate-fadeIn">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-sage-600 border-t-sage-200 rounded-full animate-spin-reverse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Processing image in {selectedLanguage}...</p>
        </div>
      )}

      {extractedText && (
        <div className="p-6 rounded-lg bg-white/50 dark:bg-black/50 border border-sage-200 dark:border-sage-800 shadow-lg animate-fadeIn">
          <h3 className="font-medium mb-2 text-sage-800 dark:text-sage-200">Extracted Text:</h3>
          <p className="text-muted-foreground">{extractedText}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive animate-shake">
          {error}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
