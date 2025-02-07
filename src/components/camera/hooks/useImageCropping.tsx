
import { useState } from "react";
import { Crop } from "react-image-crop";

export const useImageCropping = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);

  const getCroppedImage = async (sourceImage: string, cropData: Crop): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Failed to get canvas context');
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Set canvas dimensions to match crop size
          canvas.width = cropData.width;
          canvas.height = cropData.height;

          // Fill with white background first
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the cropped portion
          ctx.drawImage(
            image,
            cropData.x,
            cropData.y,
            cropData.width,
            cropData.height,
            0,
            0,
            cropData.width,
            cropData.height
          );

          const croppedImageUrl = canvas.toDataURL('image/jpeg', 1.0);
          console.log('Successfully created cropped image');
          resolve(croppedImageUrl);
        } catch (error) {
          console.error('Error during crop operation:', error);
          reject(error);
        }
      };

      image.onerror = () => {
        console.error('Failed to load image for cropping');
        reject(new Error('Failed to load image for cropping'));
      };

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
