
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface ImageUploadProps {
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUpload({ previewUrl, onFileChange }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="image">Image</Label>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected sculpture"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Plus className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          required
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
