
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function ImageUpload({ previewUrl, onFileChange, className }: ImageUploadProps) {
  return (
    <div className={cn(
      "relative aspect-square w-full overflow-hidden rounded-xl border border-muted bg-background",
      className
    )}>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Profile"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <User className="w-12 h-12 text-muted-foreground/40" />
        </div>
      )}
      <Input
        id="image"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
}
