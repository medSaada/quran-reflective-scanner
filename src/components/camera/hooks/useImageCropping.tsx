
import { useState } from "react";
import { Crop } from "react-image-crop";

export const useImageCropping = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);

  const getCroppedImage = async (sourceImage: string, cropData: Crop): Promise<string> => {
    return new Promise((resolve) => {
      const image = new Image();
      
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }

        requestAnimationFrame(() => {
          const displayedImage = document.querySelector('.ReactCrop__image');
          if (!displayedImage || !(displayedImage instanceof HTMLImageElement)) {
            console.error('Could not find displayed image element');
            resolve(sourceImage);
            return;
          }

          const displayWidth = displayedImage.clientWidth;
          const displayHeight = displayedImage.clientHeight;

          const scaleX = image.naturalWidth / displayWidth;
          const scaleY = image.naturalHeight / displayHeight;

          const scaledCrop = {
            x: Math.round(cropData.x * scaleX),
            y: Math.round(cropData.y * scaleY),
            width: Math.round(cropData.width * scaleX),
            height: Math.round(cropData.height * scaleY)
          };

          canvas.width = scaledCrop.width;
          canvas.height = scaledCrop.height;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(
            image,
            scaledCrop.x,
            scaledCrop.y,
            scaledCrop.width,
            scaledCrop.height,
            0,
            0,
            scaledCrop.width,
            scaledCrop.height
          );

          const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
          resolve(croppedImageUrl);
        });
      };

      image.onerror = () => {
        console.error('Failed to load image for cropping');
        resolve(sourceImage);
      };

      image.crossOrigin = 'anonymous';
      image.src = sourceImage;
    });
  };

  return {
    capturedImage,
    setCapturedImage,
    croppedImage,
    setCroppedImage,
    crop,
    setCrop,
    isCropping,
    setIsCropping,
    getCroppedImage
  };
};
