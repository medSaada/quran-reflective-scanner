
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useImageProcessing } from "@/components/camera/hooks/useImageProcessing";
import { useToast } from "@/components/ui/use-toast";
import { Language } from "@/types/language";
import { processData } from "@/utils/api";

const WaitingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { processImage } = useImageProcessing();
  
  const imageData = location.state?.imageData;
  const ayahText = location.state?.ayahText;
  const language = location.state?.language as Language;

  useEffect(() => {
    const processContent = async () => {
      if (!imageData && !ayahText) {
        navigate("/home");
        return;
      }

      try {
        let result;
        if (imageData) {
          result = await processImage(imageData);
          navigate("/scan-results", { 
            state: { 
              result,
              language 
            }
          });
        } else {
          result = await processData({ 
            text: ayahText, 
            language: language || 'Arabic'
          });
          navigate("/results", { 
            state: { 
              result,
              language 
            }
          });
        }
      } catch (error) {
        console.error('Error processing content:', error);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: error instanceof Error ? error.message : "Failed to connect to API server. Please check your connection and try again.",
          duration: 5000,
        });
        navigate("/home");
      }
    };

    processContent();
  }, [imageData, ayahText, language, navigate, processImage, toast]);

  if (!imageData && !ayahText) {
    navigate("/home");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="glass p-8 rounded-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sage-200/20 to-sand-200/20 animate-shimmer" />
        
        <div className="text-center space-y-4 relative z-10">
          <h1 className="text-2xl font-semibold text-sage-800 dark:text-sage-200">
            {imageData ? "Processing Your Ayah" : "Processing Your Text"}
          </h1>
          
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-sage-300 dark:border-sage-700 animate-spin-slow" />
            <div className="absolute inset-2 rounded-full border-4 border-sand-400 dark:border-sand-600 animate-spin-reverse" />
            <div className="absolute inset-4 rounded-full border-4 border-sage-500 dark:border-sage-500 animate-pulse" />
          </div>

          <p className="text-sage-600 dark:text-sage-400 animate-pulse">
            Finding deeper meanings in {language || "Arabic"}...
          </p>
          
          <Progress value={66} className="w-full animate-pulse" />
          
          <p className="text-sm text-sage-500 dark:text-sage-500 animate-bounce">
            This will just take a moment
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
