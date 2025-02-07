
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
      const base64Data = imageDataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      
      console.log('Sending request to API...');
      const apiResponse = await axios.post<ExtractedText>(
        'http://127.0.0.1:8000/process-image/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: controller.signal
        }
      );
      
      console.log('API Response:', apiResponse.data);
      setExtractedText(apiResponse.data.text);
      toast({
        title: "Success",
        description: "Text extracted successfully",
      });
    } catch (err) {
      console.error('API error:', err);
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        setError("Request timed out. Please try again.");
      } else {
        setError("Failed to process image");
      }
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to extract text from image",
      });
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
