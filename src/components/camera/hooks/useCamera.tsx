
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
      console.log('Camera permission state:', result.state);
      setPermissionState(result.state);
      
      result.addEventListener('change', () => {
        console.log('Camera permission changed to:', result.state);
        setPermissionState(result.state);
      });

      if (result.state === 'granted') {
        console.log('Camera permission already granted, initializing camera');
        initializeCamera();
      }
    } catch (error) {
      console.error('Permission check error:', error);
      // Fallback: try to initialize camera directly
      initializeCamera();
    }
  };

  const initializeCamera = async () => {
    try {
      console.log('Initializing camera...');
      setError(null);
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      console.log('Camera stream obtained successfully:', mediaStream);
      setStream(mediaStream);
      setPermissionState('granted');
      
      toast({
        title: "Caméra activée",
        description: "Vous pouvez maintenant capturer des images",
      });
    } catch (err) {
      console.error('Camera initialization error:', err);
      
      let errorMessage = "Échec de l'accès à la caméra";
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = "L'accès à la caméra a été refusé. Veuillez autoriser l'accès à la caméra.";
          setPermissionState('denied');
        } else if (err.name === 'NotFoundError') {
          errorMessage = "Aucune caméra trouvée. Veuillez vous assurer que votre caméra est connectée.";
        } else if (err.name === 'NotReadableError') {
          errorMessage = "La caméra est utilisée par une autre application.";
        }
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de caméra",
        description: errorMessage,
      });
    }
  };

  useEffect(() => {
    checkCameraPermission();
    return () => {
      if (stream) {
        console.log('Cleaning up camera stream');
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
