import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera, RotateCcw } from "lucide-react";

interface ExtractedText {
  text: string;
}

const CameraCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt");
  
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
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
        processImage(imageDataUrl);
      }
    }
  };

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert base64 to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      
      const apiResponse = await axios.post<ExtractedText>(
        'http://127.0.0.1:8000/process-image/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setExtractedText(apiResponse.data.text);
      toast({
        title: "Success",
        description: "Text extracted successfully",
      });
    } catch (err) {
      console.error('API error:', err);
      setError("Failed to process image");
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to extract text from image",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryCapture = () => {
    setCapturedImage(null);
    setExtractedText("");
    setError(null);
  };

  if (permissionState === "denied") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 glass rounded-xl text-center">
        <p className="text-destructive font-medium">Camera access was denied</p>
        <Button
          variant="outline"
          onClick={() => {
            window.location.reload();
          }}
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
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={retryCapture}
              disabled={isLoading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing image...
        </div>
      )}

      {extractedText && (
        <div className="p-4 rounded-lg bg-background/50 border">
          <h3 className="font-medium mb-2">Extracted Text:</h3>
          <p className="text-muted-foreground">{extractedText}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;