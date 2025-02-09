
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ExtractedText } from "@/types/api";

export const useImageProcessing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const { toast } = useToast();

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // Convert the base64 image to a blob
      const base64Data = imageDataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Create FormData and append the blob
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');
      
      console.log('Sending request to API with cropped image...');
      const apiResponse = await axios.post<ExtractedText>(
        'http://127.0.0.1:8000/process-image/',
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          signal: controller.signal,
          timeout: 10000
        }
      );
      
      console.log('API Response:', apiResponse.data);
      setExtractedText(apiResponse.data.text);
      return apiResponse.data;
    } catch (err) {
      console.error('API error:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_CANCELED') {
          setError("Request timed out. Please try again.");
        } else if (err.code === 'ERR_NETWORK') {
          setError("Cannot connect to API server. Please check if the server is running.");
        } else {
          setError(`Failed to process image: ${err.message}`);
        }
      } else {
        setError("Failed to process image");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    extractedText,
    processImage
  };
};
