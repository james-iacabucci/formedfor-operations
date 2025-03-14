
import { Input } from "@/components/ui/input";
import { User, PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface ImageUploadProps {
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ previewUrl, onFileChange, className, disabled = false }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-xl border border-muted bg-background",
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt="Profile"
            className="object-cover w-full h-full"
          />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-white">
                <PencilIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Edit picture</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <User className="w-12 h-12 text-muted-foreground/40" />
          <span className="text-sm text-muted-foreground">Add picture</span>
        </div>
      )}
      <Input
        ref={fileInputRef}
        id="image"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
