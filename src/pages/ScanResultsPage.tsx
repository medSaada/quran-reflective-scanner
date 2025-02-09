
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Language } from "@/types/language";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ScanResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!location.state?.result) {
      navigate("/home");
    }
  }, [location.state, navigate]);

  const result = location.state?.result;
  const language = location.state?.language as Language;

  const extractContent = () => {
    try {
      if (typeof result.text === 'string' && result.text.includes('```json')) {
        console.log('Parsing JSON from text field:', result.text);
        const textWithoutBackticks = result.text.replace(/```json\n|\n```/g, '');
        const parsed = JSON.parse(textWithoutBackticks);
        return {
          ayah: parsed.text || "",
          translation: parsed.translation || "",
          tafsir: parsed.tafsir || "Tafsir not available for this ayah.",
          imageUrl: location.state?.imageUrl
        };
      }
      
      console.log('Using direct result object:', result);
      if (typeof result === 'object') {
        return {
          ayah: result.text || "",
          translation: result.translation || "",
          tafsir: result.tafsir || "Tafsir not available for this ayah.",
          imageUrl: location.state?.imageUrl
        };
      }

      console.log('Failed to extract content, using default values');
      return {
        ayah: "",
        translation: "",
        tafsir: "Unable to process scan result",
        imageUrl: null
      };
    } catch (error) {
      console.error('Error extracting content:', error);
      toast({
        title: "Error",
        description: "Failed to process the scan response",
        variant: "destructive"
      });
      return {
        ayah: result?.text || "",
        translation: "",
        tafsir: "Error processing scan result",
        imageUrl: null
      };
    }
  };

  const content = extractContent();

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-background to-muted/20 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-background/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="hover:bg-background/80"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>

        <Card className="border-2 border-muted shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center">
              Extracted Ayah
            </CardTitle>
            <CardDescription className="text-center">
              Results from {language || "Arabic"} text processing
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {content.imageUrl && (
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <img
                  src={content.imageUrl}
                  alt="Processed image"
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="text-right">
                <p className="text-2xl leading-relaxed font-arabic break-words">
                  {content.ayah}
                </p>
              </div>

              {content.translation && (
                <div className="border-t pt-4">
                  <p className="text-lg italic text-muted-foreground">
                    {content.translation}
                  </p>
                </div>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tafsir">
                <AccordionTrigger className="text-lg font-semibold">
                  Tafsir & Explanation
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                  {content.tafsir}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full max-w-xs"
          >
            Scan Another Ayah
          </Button>
          <Button
            onClick={() => navigate("/home")}
            className="w-full max-w-xs"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanResultsPage;
