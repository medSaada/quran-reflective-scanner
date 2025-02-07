import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    navigate("/home");
    return null;
  }

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
          <h1 className="text-3xl font-semibold text-center bg-gradient-to-r from-sage-600 to-sand-600 dark:from-sage-400 dark:to-sand-400 bg-clip-text text-transparent">
            Your Processed Ayah
          </h1>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-sage-700 dark:text-sage-300">
                Original Text
              </h2>
              <p className="text-lg text-right font-arabic">{result.text}</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-sage-700 dark:text-sage-300">
                Translation
              </h2>
              <p className="text-lg italic text-sage-600 dark:text-sage-400">
                {result.translation}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-sage-700 dark:text-sage-300">
                Reflection
              </h2>
              <p className="text-lg text-sage-600 dark:text-sage-400">
                {result.reflection}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;