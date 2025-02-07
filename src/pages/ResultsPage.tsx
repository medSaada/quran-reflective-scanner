
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Language } from "@/types/language";
import ReflectionCard from "@/components/ReflectionCard";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const language = location.state?.language as Language;

  if (!result) {
    navigate("/home");
    return null;
  }

  // Parse the text response from the API which is in JSON format
  let parsedText;
  try {
    const textWithoutBackticks = result.text.replace(/```json\n|\n```/g, '');
    parsedText = JSON.parse(textWithoutBackticks);
  } catch (error) {
    console.error('Error parsing result:', error);
    parsedText = { text: result.text };
  }

  // Get current date for the reflection card
  const currentDate = new Date().toLocaleDateString();

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
          ayah={parsedText.French || parsedText.text || ""}
          translation={parsedText.Time || ""}
          reflection={parsedText.tafsir || "Processing completed successfully."}
          date={currentDate}
          className="animate-slideUp"
        />
      </div>
    </div>
  );
};

export default ResultsPage;
