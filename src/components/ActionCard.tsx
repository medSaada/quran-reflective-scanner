import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const ActionCard = ({ title, description, icon, onClick, className }: ActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-6 glass rounded-2xl card-hover text-left",
        "transition-all duration-300 group",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-sage-100 text-sage-700 group-hover:bg-sage-200 transition-colors">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ActionCard;