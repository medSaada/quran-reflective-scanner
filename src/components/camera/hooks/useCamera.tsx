
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("prompt");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    checkCameraPermission();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    stream,
    error,
    permissionState,
    initializeCamera
  };
};
