import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CameraInitializerProps {
  onCameraReady: (stream: MediaStream) => void;
  isLoading: boolean;
}

export const CameraInitializer = ({ onCameraReady, isLoading }: CameraInitializerProps) => {
  const { toast } = useToast();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      onCameraReady(stream);
      
      toast({
        title: "Camera activated",
        description: "You can now take a picture",
      });
    } catch (error) {
      console.error('Camera initialization error:', error);
      toast({
        title: "Camera Error",
        description: error instanceof Error ? error.message : "Failed to access camera",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <button
        onClick={initializeCamera}
        className="p-6 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors animate-glow dark:bg-sage-900 dark:text-sage-100 disabled:opacity-50"
        disabled={isLoading}
      >
        <Camera className="w-8 h-8" />
      </button>
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Activating camera..." : "Tap to activate camera"}
      </p>
    </div>
  );
};