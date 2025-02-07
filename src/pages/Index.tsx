import { Book, Camera, Heart, Home } from "lucide-react";
import ActionCard from "@/components/ActionCard";
import ReflectionCard from "@/components/ReflectionCard";
import CameraCapture from "@/components/CameraCapture";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { processData } from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { Squares } from "@/components/ui/squares-background";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const Index = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [ayahText, setAyahText] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProcessData = async (data: any) => {
    try {
      const result = await processData(data);
      toast({
        title: "Success",
        description: "Data processed successfully",
      });
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process data",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = async () => {
    if (!ayahText.trim()) {
      toast({
        title: "Error",
        description: "Please enter an ayah",
        variant: "destructive",
      });
      return;
    }

    try {
      await handleProcessData({ text: ayahText });
      setAyahText("");
      setShowManualEntry(false);
      toast({
        title: "Success",
        description: "Ayah processed successfully",
      });
    } catch (error) {
      console.error("Error processing ayah:", error);
    }
  };

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
          Quran Tadabbur
        </h1>
        <p className="text-muted-foreground text-lg">
          Reflect on the Quran with ease
        </p>
      </header>

      {showCamera ? (
        <div className="space-y-4 animate-fadeIn">
          <button
            onClick={() => setShowCamera(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
          <CameraCapture />
        </div>
      ) : showManualEntry ? (
        <div className="space-y-4 animate-fadeIn max-w-2xl mx-auto">
          <button
            onClick={() => setShowManualEntry(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
          <div className="space-y-4 glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-sage-700 dark:text-sage-300">Enter Ayah</h2>
            <Textarea
              placeholder="Type or paste the Quranic verse here..."
              value={ayahText}
              onChange={(e) => setAyahText(e.target.value)}
              className="min-h-[150px] text-lg"
            />
            <Button 
              onClick={handleManualSubmit}
              className="w-full"
            >
              Process Ayah
            </Button>
          </div>
        </div>
      ) : (
        <main className="space-y-8 max-w-2xl mx-auto">
          <section className="grid gap-4">
            <ActionCard
              icon={<Camera className="w-6 h-6" />}
              title="Scan Ayah"
              description="Use your camera to scan and reflect on any verse"
              onClick={() => setShowCamera(true)}
              className="animate-float"
            />
            <ActionCard
              icon={<Book className="w-6 h-6" />}
              title="Enter Manually"
              description="Type or paste the verse you want to reflect on"
              onClick={() => setShowManualEntry(true)}
              className="animate-float [animation-delay:200ms]"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 justify-center glass px-4 py-2 rounded-full shadow-lg w-fit mx-auto">
              <Heart className="w-5 h-5 text-sage-600 animate-pulse" />
              <h2 className="font-medium text-lg text-sage-800 dark:text-sage-200">Recent Reflections</h2>
            </div>
            <div className="grid gap-4">
              <ReflectionCard
                ayah="وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ"
                translation="And I did not create the jinn and mankind except to worship Me"
                reflection="This verse reminds us of our primary purpose in life - to worship Allah. It gives clarity to our existence and helps focus our daily actions."
                date="Today at 2:30 PM"
                className="animate-slideUp"
              />
              <ReflectionCard
                ayah="فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ"
                translation="So remember Me; I will remember you. And be grateful to Me and do not deny Me"
                reflection="A beautiful reminder of the reciprocal nature of our relationship with Allah. When we remember Him, He remembers us."
                date="Yesterday at 9:15 AM"
                className="animate-slideUp [animation-delay:200ms]"
              />
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default Index;