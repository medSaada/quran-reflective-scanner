import { useEffect, useState } from 'react';
import { Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface CameraInitializerProps {
  onCameraReady: (stream: MediaStream) => void;
  isLoading: boolean;
}

export const CameraInitializer = ({ onCameraReady, isLoading }: CameraInitializerProps) => {
  const { toast } = useToast();
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

  // Check initial permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermissionState(result.state);
        });
        
        // If already granted, initialize camera
        if (result.state === 'granted') {
          initializeCamera();
        }
      } catch (error) {
        console.error('Permission check error:', error);
        // Fallback to requesting permission directly if query isn't supported
        initializeCamera();
      }
    };

    checkPermission();
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

      onCameraReady(stream);
      
      toast({
        title: "Camera activated",
        description: "You can now take a picture",
      });
    } catch (error) {
      console.error('Camera initialization error:', error);
      
      let errorMessage = 'Failed to access camera';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access was denied. Please grant permission to use the camera.';
          setPermissionState('denied');
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera device found. Please ensure your camera is connected.';
        }
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getPermissionMessage = () => {
    switch (permissionState) {
      case 'denied':
        return "Camera access was denied. Please grant permission in your browser settings.";
      case 'prompt':
        return "Tap to activate camera";
      default:
        return "Tap to activate camera";
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <button
        onClick={initializeCamera}
        className="p-6 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors animate-glow dark:bg-sage-900 dark:text-sage-100 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <Camera className="w-8 h-8" />
      </button>
      <p className="text-sm text-muted-foreground max-w-xs">
        {isLoading ? "Activating camera..." : getPermissionMessage()}
      </p>
      {permissionState === 'denied' && (
        <Button
          variant="outline"
          onClick={() => {
            // Open browser settings
            window.open('chrome://settings/content/camera');
          }}
          className="mt-2"
        >
          Open Camera Settings
        </Button>
      )}
    </div>
  );
};