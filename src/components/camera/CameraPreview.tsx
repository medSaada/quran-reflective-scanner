import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface CameraPreviewProps {
  stream: MediaStream;
  onCapture: (imageData: string) => void;
}

export const CameraPreview = ({ stream, onCapture }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
      }
    }
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-xl"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <Button
          onClick={handleCapture}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16 p-0 bg-white/80 hover:bg-white/90 transition-colors"
        >
          <div className="w-12 h-12 rounded-full border-4 border-sage-600" />
        </Button>
      </div>
    </div>
  );
};