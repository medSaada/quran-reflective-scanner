
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, XCircle } from "lucide-react";
import { Language } from "@/types/language";
import { ImagePreview } from "./camera/ImagePreview";
import { ImageCropper } from "./camera/ImageCropper";
import { CameraPermissionDenied } from "./camera/CameraPermissionDenied";
import { useCamera } from "./camera/hooks/useCamera";
import { useImageProcessing } from "./camera/hooks/useImageProcessing";
import { useImageCropping } from "./camera/hooks/useImageCropping";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CameraCaptureProps {
  selectedLanguage: Language;
}

const CameraCapture = ({ selectedLanguage }: CameraCaptureProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, error: cameraError, permissionState, initializeCamera } = useCamera();
  const { isLoading, error: processingError, extractedText, setExtractedText, processImage, processText } = useImageProcessing();
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

  // Set up video stream when available
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('Setting up video stream');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
        toast({
          variant: "destructive",
          title: "Erreur vidéo",
          description: "Impossible de démarrer la vidéo de la caméra.",
        });
      });
    }
  }, [stream, toast]);

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

        // Process the cropped image
        const result = await processImage(croppedImageUrl);
        if (result && result.text) {
          setExtractedText(result.text);
        }
      } catch (error) {
        console.error('Error during crop:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Échec du recadrage de l'image. Veuillez réessayer.",
        });
      }
    }
  };

  const handleConfirmText = () => {
    if (extractedText) {
      navigate("/waiting", { 
        state: { 
          ayahText: extractedText,
          language: selectedLanguage,
          imageUrl: croppedImage 
        }
      });
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
    setExtractedText("");
    initializeCamera();
  };

  if (permissionState === "denied") {
    return <CameraPermissionDenied />;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto animate-fadeIn">
      <Card className="border-2 border-muted">
        <CardHeader>
          <CardTitle>Scanner une Ayah</CardTitle>
          <CardDescription>
            {!capturedImage 
              ? "Étape 1 : Prenez en photo l'ayah que vous souhaitez étudier"
              : isCropping
                ? "Étape 2 : Recadrez l'image pour isoler l'ayah"
                : extractedText
                  ? "Étape 3 : Vérifiez le texte extrait"
                  : "Étape 2 : Traitement de l'image"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!capturedImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-sage-900/90 to-sage-800/90 shadow-xl">
              {stream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
                    <Button
                      onClick={captureImage}
                      size="icon"
                      className="rounded-full w-12 h-12 bg-white/90 hover:bg-white/100 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-sage-300/50"
                      disabled={isLoading}
                    >
                      <Camera className="w-5 h-5 text-sage-800" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <Button
                    onClick={initializeCamera}
                    className="p-6 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors animate-glow dark:bg-sage-900 dark:text-sage-100"
                    disabled={isLoading}
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {isLoading ? "Activation de la caméra..." : "Appuyez pour activer la caméra"}
                  </p>
                </div>
              )}
            </div>
          ) : isCropping ? (
            <ImageCropper
              imageUrl={capturedImage}
              crop={crop}
              onCropChange={setCrop}
              onSave={handleConfirmCrop}
              onReset={retakeImage}
            />
          ) : extractedText ? (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-2xl text-right font-arabic">{extractedText}</p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={retakeImage}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Non, retenter
                </Button>
                <Button
                  onClick={handleConfirmText}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Oui, c'est correct
                </Button>
              </div>
            </div>
          ) : (
            <ImagePreview
              imageUrl={croppedImage || capturedImage}
              onRetake={retakeImage}
              onConfirm={handleConfirmText}
            />
          )}
        </CardContent>
      </Card>

      {(cameraError || processingError) && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive animate-shake">
          {cameraError || processingError}
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
