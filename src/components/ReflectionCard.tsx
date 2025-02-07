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
    <div className={cn(
      "p-6 bg-background/50 dark:bg-black/20 backdrop-blur-md rounded-2xl space-y-4",
      "shadow-sm hover:shadow-lg dark:shadow-none",
      "hover:-translate-y-1 transition-all duration-300",
      className
    )}>
      <div className="space-y-2">
        <p className="text-right text-xl leading-relaxed font-arabic">{ayah}</p>
        <p className="text-sm text-muted-foreground italic">{translation}</p>
      </div>
      <div className="pt-4 border-t border-sage-200/20 dark:border-sage-700/20">
        <p className="text-sm">{reflection}</p>
        <p className="text-xs text-muted-foreground mt-2">{date}</p>
      </div>
    </div>
  );
};

export default ReflectionCard;