import { cn } from "@/lib/utils";

interface ReflectionCardProps {
  ayah: string;
  translation: string;
  reflection: string;
  date: string;
  className?: string;
}

const ReflectionCard = ({ ayah, translation, reflection, date, className }: ReflectionCardProps) => {
  return (
    <div className={cn("p-6 glass rounded-2xl space-y-4", className)}>
      <div className="space-y-2">
        <p className="text-right text-xl leading-relaxed">{ayah}</p>
        <p className="text-sm text-muted-foreground italic">{translation}</p>
      </div>
      <div className="pt-4 border-t border-border">
        <p className="text-sm">{reflection}</p>
        <p className="text-xs text-muted-foreground mt-2">{date}</p>
      </div>
    </div>
  );
};

export default ReflectionCard;