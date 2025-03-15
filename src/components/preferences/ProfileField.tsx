
import { Input } from "@/components/ui/input";

interface ProfileFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export function ProfileField({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  className = "bg-muted/50 border-0 h-12 text-base placeholder:text-muted-foreground/50"
}: ProfileFieldProps) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className={className}
      disabled={disabled}
    />
  );
}
