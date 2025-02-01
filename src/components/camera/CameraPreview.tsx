import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface CameraPreviewProps {
  stream: MediaStream;
  onCapture: (imageData: string) => void;
}

export const CameraPreview = ({ stream, onCapture }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
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
  );
};