import { Book, Camera, Heart } from "lucide-react";
import ActionCard from "@/components/ActionCard";
import ReflectionCard from "@/components/ReflectionCard";
import CameraView from "@/components/CameraView";
import { useState } from "react";

const Index = () => {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fadeIn">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Quran Tadabbur
        </h1>
        <p className="text-muted-foreground">
          Reflect on the Quran with ease
        </p>
      </header>

      {showCamera ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowCamera(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
          <CameraView />
        </div>
      ) : (
        <main className="space-y-8">
          <section className="grid gap-4">
            <ActionCard
              icon={<Camera className="w-6 h-6" />}
              title="Scan Ayah"
              description="Use your camera to scan and reflect on any verse"
              onClick={() => setShowCamera(true)}
            />
            <ActionCard
              icon={<Book className="w-6 h-6" />}
              title="Enter Manually"
              description="Type or paste the verse you want to reflect on"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-sage-600" />
              <h2 className="font-medium">Recent Reflections</h2>
            </div>
            <div className="grid gap-4">
              <ReflectionCard
                ayah="وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ"
                translation="And I did not create the jinn and mankind except to worship Me"
                reflection="This verse reminds us of our primary purpose in life - to worship Allah. It gives clarity to our existence and helps focus our daily actions."
                date="Today at 2:30 PM"
              />
              <ReflectionCard
                ayah="فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ"
                translation="So remember Me; I will remember you. And be grateful to Me and do not deny Me"
                reflection="A beautiful reminder of the reciprocal nature of our relationship with Allah. When we remember Him, He remembers us."
                date="Yesterday at 9:15 AM"
              />
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default Index;