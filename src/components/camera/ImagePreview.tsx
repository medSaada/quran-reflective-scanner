
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  imageUrl: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export const ImagePreview = ({ imageUrl, onRetake, onConfirm }: ImagePreviewProps) => {
  return (
    <div className="relative h-full">
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <Button
          onClick={onRetake}
          variant="destructive"
        >
          Retake
        </Button>
        <Button
          onClick={onConfirm}
          variant="default"
          className="bg-sage-600 hover:bg-sage-700"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
