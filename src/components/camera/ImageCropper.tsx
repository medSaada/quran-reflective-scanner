
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageUrl: string;
  crop: Crop | undefined;
  onCropChange: (crop: Crop) => void;
  onSave: () => void;
  onReset: () => void;
}

export const ImageCropper = ({ 
  imageUrl, 
  crop, 
  onCropChange, 
  onSave, 
  onReset 
}: ImageCropperProps) => {
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ReactCrop
          crop={crop}
          onChange={onCropChange}
          className="h-full"
          minWidth={100}
          minHeight={100}
        >
          <img
            src={imageUrl}
            alt="Captured"
            className="max-h-full w-full object-contain"
          />
        </ReactCrop>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={onReset}
          variant="destructive"
          size="icon"
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          onClick={onSave}
          variant="default"
          className="bg-sage-600 hover:bg-sage-700"
          disabled={!crop || !crop.width || !crop.height}
        >
          Save Crop
        </Button>
      </div>
    </div>
  );
};
