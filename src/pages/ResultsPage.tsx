
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Book, ScrollText, BookOpen } from "lucide-react";
import { Language } from "@/types/language";
import ReflectionCard from "@/components/ReflectionCard";
import { useToast } from "@/components/ui/use-toast";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const result = location.state?.result;
  const language = location.state?.language as Language;
  const [activeView, setActiveView] = useState<"manager" | "authentic" | "curated" | "tadabur">("manager");

  if (!result) {
    navigate("/home");
    return null;
  }

  // Get current date for the reflection card
  const currentDate = new Date().toLocaleDateString();

  // Function to extract content based on result type and view
  const extractContent = () => {
    try {
      // For image processing results (which come as JSON string)
      if (typeof result.text === 'string' && result.text.includes('```json')) {
        const textWithoutBackticks = result.text.replace(/```json\n|\n```/g, '');
        const parsed = JSON.parse(textWithoutBackticks);
        
        switch (activeView) {
          case "authentic":
            return {
              ayah: parsed.authenticHadith || "No authentic hadith available",
              translation: language,
              reflection: "Authentic Hadith Collection"
            };
          case "curated":
            return {
              ayah: parsed.curatedHadith || "No curated hadith available",
              translation: language,
              reflection: "Curated Hadith Collection"
            };
          case "tadabur":
            return {
              ayah: parsed.tadaburGuidance || "No tadabur guidance available",
              translation: language,
              reflection: "Tadabur Guidance"
            };
          default:
            return {
              ayah: parsed.text || "",
              translation: language || "",
              reflection: "Crew AI processing completed"
            };
        }
      }
      
      // For manual text input results
      if (typeof result === 'object') {
        switch (activeView) {
          case "authentic":
            return {
              ayah: result.authenticHadith || "No authentic hadith available",
              translation: language,
              reflection: "Authentic Hadith Collection"
            };
          case "curated":
            return {
              ayah: result.curatedHadith || "No curated hadith available",
              translation: language,
              reflection: "Curated Hadith Collection"
            };
          case "tadabur":
            return {
              ayah: result.tadaburGuidance || "No tadabur guidance available",
              translation: language,
              reflection: "Tadabur Guidance"
            };
          default:
            return {
              ayah: result.text || "",
              translation: language || "",
              reflection: "Crew AI processing completed"
            };
        }
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
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={activeView === "tadabur" ? "default" : "outline"}
            onClick={() => setActiveView("tadabur")}
          >
            <BookOpen className="mr-2" />
            Tadabur Guidance
          </Button>
          <Button
            variant={activeView === "authentic" ? "default" : "outline"}
            onClick={() => setActiveView("authentic")}
          >
            <Book className="mr-2" />
            Authentic Ahadith
          </Button>
          <Button
            variant={activeView === "curated" ? "default" : "outline"}
            onClick={() => setActiveView("curated")}
          >
            <ScrollText className="mr-2" />
            Curated Ahadith
          </Button>
        </div>

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
