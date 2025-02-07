import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Squares } from "@/components/ui/squares-background";

const ProcessedText = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { processedData } = location.state || {};

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fadeIn relative">
      <div className="absolute inset-0 -z-10">
        <Squares 
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#333" 
          hoverFillColor="#222"
        />
      </div>
      
      <header className="space-y-2 text-center relative">
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-0 glass shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-sage-300 dark:border-sage-700"
          onClick={() => navigate('/')}
        >
          <Home className="w-5 h-5 text-sage-700 dark:text-sage-300" />
        </Button>
        <h1 className="text-4xl font-semibold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-r from-sage-600 to-sand-600 dark:from-sand-400 dark:to-sand-200">
          Processed Text Result
        </h1>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        <div className="glass p-6 rounded-2xl space-y-6">
          {processedData ? (
            <>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-sage-700 dark:text-sage-300">
                  Analysis Result
                </h2>
                <pre className="whitespace-pre-wrap text-lg">
                  {JSON.stringify(processedData, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              No processed data available. Please return to home and submit text for processing.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProcessedText;