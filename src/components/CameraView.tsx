import { Camera } from "lucide-react";
import { useState } from "react";

const CameraView = () => {
  const [isActive, setIsActive] = useState(false);

  const handleActivateCamera = () => {
    setIsActive(true);
    // Here we would implement actual camera activation
    console.log("Camera activated");
  };

  return (
    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass animate-fadeIn">
      {!isActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleActivateCamera}
            className="p-6 rounded-full bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors animate-glow dark:bg-sage-900 dark:text-sage-100"
          >
            <Camera className="w-8 h-8" />
          </button>
          <p className="text-sm text-muted-foreground">Tap to activate camera</p>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 aspect-[4/1] border-2 border-sage-500/50 rounded-lg animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1000px_100%]" />
        </div>
      )}
    </div>
  );
};

export default CameraView;