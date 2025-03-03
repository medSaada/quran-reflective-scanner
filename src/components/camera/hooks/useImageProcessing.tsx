
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ExtractedText } from "@/types/api";
import { processData } from "@/utils/api";
import { Language } from "@/types/language";

export const useImageProcessing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const { toast } = useToast();

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    
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
          }
        }
      );
      
      console.log('API Response:', apiResponse.data);
      setExtractedText(apiResponse.data.text);
      return apiResponse.data;
    } catch (err) {
      console.error('API error:', err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError("Cannot connect to API server. Please check if the server is running.");
        } else {
          setError(`Failed to process image: ${err.message}`);
        }
      } else {
        setError("Failed to process image");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const processText = async (text: string, language: Language) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await processData({ text, language });
      return result;
    } catch (err) {
      console.error('Text processing error:', err);
      setError("Failed to process text");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    extractedText,
    setExtractedText,
    processImage,
    processText
  };
};

