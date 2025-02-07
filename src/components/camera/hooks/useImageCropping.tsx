
import { useState } from "react";
import { Crop } from "react-image-crop";

export const useImageCropping = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);

  const getCroppedImage = async (sourceImage: string, cropData: Crop): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Create an image to get original dimensions
      const image = new Image();
      image.onload = () => {
        try {
          // Create a temporary image element to get displayed dimensions
          const displayImg = document.querySelector('img[alt="Captured"]') as HTMLImageElement;
          if (!displayImg) {
            console.error('Could not find displayed image element');
            reject(new Error('Could not find displayed image element'));
            return;
          }

          // Calculate scaling factors
          const scaleX = image.naturalWidth / displayImg.width;
          const scaleY = image.naturalHeight / displayImg.height;

          console.log('Original dimensions:', image.naturalWidth, 'x', image.naturalHeight);
          console.log('Display dimensions:', displayImg.width, 'x', displayImg.height);
          console.log('Scale factors:', scaleX, scaleY);

          // Scale crop coordinates to match original image dimensions
          const scaledCrop = {
            x: cropData.x * scaleX,
            y: cropData.y * scaleY,
            width: cropData.width * scaleX,
            height: cropData.height * scaleY
          };

          console.log('Original crop:', cropData);
          console.log('Scaled crop:', scaledCrop);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Failed to get canvas context');
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Set canvas dimensions to match crop size
          canvas.width = scaledCrop.width;
          canvas.height = scaledCrop.height;

          // Fill with white background first
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the cropped portion using scaled coordinates
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
