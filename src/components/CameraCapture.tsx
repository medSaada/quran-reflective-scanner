import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera, RotateCcw, Check, X } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ExtractedText {
  text: string;
}

const CameraCapture = () => {
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

        // ReactCrop gives us percentage values, so we need to convert them to pixels
        const pixelRatio = window.devicePixelRatio || 1;
        const scaleX = (image.naturalWidth * pixelRatio) / 100;
        const scaleY = (image.naturalHeight * pixelRatio) / 100;

        // Set the canvas size to match the crop dimensions
        canvas.width = Math.round(cropData.width * scaleX);
        canvas.height = Math.round(cropData.height * scaleY);

        // Ensure high-quality downscaling
        ctx.imageSmoothingQuality = 'high';
        ctx.imageSmoothingEnabled = true;

        // Clear the canvas before drawing (important!)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the cropped portion
        ctx.drawImage(
          image,
          Math.round(cropData.x * scaleX),    // source x
          Math.round(cropData.y * scaleY),    // source y
          canvas.width,                        // source width
          canvas.height,                       // source height
          0,                                  // dest x
          0,                                  // dest y
          canvas.width,                       // dest width
          canvas.height                       // dest height
        );

        // Convert to base64 with high quality
        const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.log('Cropped image generated:', {
          originalSize: {
            width: image.naturalWidth,
            height: image.naturalHeight
          },
          cropData: cropData,
          finalSize: {
            width: canvas.width,
            height: canvas.height
          }
        });
        
        resolve(croppedImageUrl);
      };

      // Handle image loading errors
      image.onerror = () => {
        console.error('Failed to load image for cropping');
        resolve(sourceImage); // Fallback to original image
      };

      // Set crossOrigin to anonymous to avoid CORS issues with canvas
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
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              onClick={captureImage}
              size="lg"
              className="rounded-full w-16 h-16 bg-white/80 hover:bg-white/90"
              disabled={isLoading || !stream}
            >
              <Camera className="w-8 h-8 text-sage-600" />
            </Button>
          </div>
        </div>
      ) : isCropping ? (
        <div className="space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            className="rounded-lg overflow-hidden bg-black"
          >
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </ReactCrop>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={retakeImage}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              onClick={handleConfirmCrop}
              className="flex items-center gap-2"
              disabled={!crop}
            >
              <Check className="w-4 h-4" />
              Confirm Crop
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={croppedImage || capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            <Button
              variant="outline"
              onClick={retakeImage}
              className="absolute top-4 right-4 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-sage-600 border-t-sage-200 rounded-full animate-spin-reverse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Processing image...</p>
        </div>
      )}

      {extractedText && (
        <div className="p-4 rounded-lg bg-background/50 border animate-fadeIn">
          <h3 className="font-medium mb-2">Extracted Text:</h3>
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
