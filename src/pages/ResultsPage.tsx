
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Book, BookOpen } from "lucide-react";
import { Language } from "@/types/language";
import ReflectionCard from "@/components/ReflectionCard";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuthenticHadithEntry {
  number: number;
  arabicText: string;
  source: {
    name: string;
    reference: string;
  };
  explanation: string;
  translation?: string;
}

interface AuthenticHadithData {
  title: string;
  hadiths: AuthenticHadithEntry[];
  context?: string;
}

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const result = location.state?.result;
  const language = location.state?.language as Language;
  const [activeView, setActiveView] = useState<"manager" | "authentic" | "tadabur">("manager");

  if (!result) {
    navigate("/home");
    return null;
  }

  const currentDate = new Date().toLocaleDateString();

  const extractContent = () => {
    try {
      if (typeof result.text === 'string' && result.text.includes('```json')) {
        const textWithoutBackticks = result.text.replace(/```json\n|\n```/g, '');
        const parsed = JSON.parse(textWithoutBackticks);
        
        switch (activeView) {
          case "authentic":
            return {
              ayah: renderAuthenticHadith(parsed.authenticHadith),
              translation: language,
              reflection: "Authentic Hadith Collection"
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
      
      if (typeof result === 'object') {
        switch (activeView) {
          case "authentic":
            return {
              ayah: renderAuthenticHadith(result.authenticHadith),
              translation: language,
              reflection: "Authentic Hadith Collection"
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

  const renderAuthenticHadith = (hadithData: AuthenticHadithData) => {
    if (!hadithData || !hadithData.hadiths) {
      return "No authentic hadith available";
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-center mb-4">{hadithData.title}</h2>
        
        {hadithData.context && (
          <div className="bg-sage-50 p-4 rounded-lg mb-6">
            <p className="text-sage-800">{hadithData.context}</p>
          </div>
        )}

        <div className="space-y-8">
          {hadithData.hadiths.map((hadith, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-sage-600">Hadith #{hadith.number}</span>
                <span className="text-sm font-medium text-sage-700">
                  {hadith.source.name} - {hadith.source.reference}
                </span>
              </div>
              
              <div className="space-y-4">
                <p className="text-right text-lg leading-relaxed">{hadith.arabicText}</p>
                
                {hadith.translation && (
                  <p className="text-gray-700">{hadith.translation}</p>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-sage-700 mb-2">Explanation:</h4>
                  <p className="text-gray-600">{hadith.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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

      <div className="max-w-4xl mx-auto space-y-8 pt-16">
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
