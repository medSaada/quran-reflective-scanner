
import { Button } from "@/components/ui/button";

export const CameraPermissionDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 glass rounded-xl text-center">
      <p className="text-destructive font-medium">Camera access was denied</p>
      <Button
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Request Permission Again
      </Button>
    </div>
  );
};
