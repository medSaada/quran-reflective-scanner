
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Language } from "@/types/language";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const language = location.state?.language as Language;

  if (!result) {
    navigate("/home");
    return null;
  }

  console.log("Result data:", result);

  // Extract text and translation from the tafsir content
  const tafsirContent = result.tafsir || "";
  const extractedText = tafsirContent.match(/\"([^\"]+)\"/) ? tafsirContent.match(/\"([^\"]+)\"/)[1] : "";
  const translationMatch = tafsirContent.match(/translates to \"([^\"]+)\"/);
  const translation = translationMatch ? translationMatch[1] : "";

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
        <div className="glass p-8 rounded-2xl space-y-6 animate-slideUp">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-sage-600 to-sand-600 dark:from-sage-400 dark:to-sand-400 bg-clip-text text-transparent">
              Your Processed Ayah
            </h1>
            <span className="text-sm text-muted-foreground">
              Language: {language || "Arabic"}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-sage-700 dark:text-sage-300">
                Original Text
              </h2>
              <p className="text-lg text-right font-arabic text-foreground">
                {extractedText}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-sage-700 dark:text-sage-300">
                Translation
              </h2>
              <p className="text-lg italic text-foreground">
                {translation}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-sage-700 dark:text-sage-300">
                Reflection
              </h2>
              <p className="text-lg text-foreground whitespace-pre-wrap">
                {result.tafsir}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
