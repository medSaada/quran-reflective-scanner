
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Language } from "@/types/language";
import ReflectionCard from "@/components/ReflectionCard";
import { useToast } from "@/components/ui/use-toast";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const result = location.state?.result;
  const language = location.state?.language as Language;

  if (!result) {
    navigate("/home");
    return null;
  }

  // Get current date for the reflection card
  const currentDate = new Date().toLocaleDateString();

  // Function to extract content based on result type
  const extractContent = () => {
    try {
      // For image processing results (which come as JSON string)
      if (typeof result.text === 'string' && result.text.includes('```json')) {
        const textWithoutBackticks = result.text.replace(/```json\n|\n```/g, '');
        const parsed = JSON.parse(textWithoutBackticks);
        return {
          ayah: parsed.French || "",
          translation: parsed.Time || "",
          reflection: parsed.tafsir || ""
        };
      }
      
      // For manual text input results
      if (typeof result === 'object') {
        return {
          ayah: result.text || "",
          translation: result.translation || "",
          reflection: result.tafsir || result.text || ""
        };
      }

      // Fallback
      return {
        ayah: "",
        translation: "",
        reflection: "Unable to process result"
      };
    } catch (error) {
      console.error('Error extracting content:', error);
      toast({
        title: "Error",
        description: "Failed to process the response",
        variant: "destructive"
      });
      return {
        ayah: result.text || "",
        translation: "",
        reflection: "Error processing result"
      };
    }
  };

  const content = extractContent();

  return (
    <div className="min-h-screen p-6 animate-fadeIn">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4"
        onClick={() => navigate("/home")}
      >
        <Home className="w-5 h-5" />
      </Button>

      <div className="max-w-2xl mx-auto space-y-8 pt-16">
        <ReflectionCard
          ayah={content.ayah}
          translation={content.translation}
          reflection={content.reflection}
          date={currentDate}
          className="animate-slideUp"
        />
      </div>
    </div>
  );
};

export default ResultsPage;
