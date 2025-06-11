
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Language, LANGUAGES } from "@/types/language";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  value: Language;
  onChange: (value: Language) => void;
  className?: string;
}

const LanguageSelector = ({ value, onChange, className }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-32 ${className}`}>
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
