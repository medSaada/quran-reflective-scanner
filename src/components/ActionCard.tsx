import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

const ActionCard = ({ icon, title, description, onClick, className }: ActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-6 glass rounded-2xl",
        "transition-all duration-300 group hover:bg-background/50 dark:hover:bg-black/20",
        "hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-sage-100/50 text-sage-700 dark:bg-sage-900/50 dark:text-sage-300 group-hover:bg-sage-200/50 dark:group-hover:bg-sage-800/50 transition-colors">
          {icon}
        </div>
        <div className="space-y-1 text-left">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;