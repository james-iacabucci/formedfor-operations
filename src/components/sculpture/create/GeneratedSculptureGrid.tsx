
import React from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GeneratedImage {
  id: string;
  url: string | null;
  isGenerating: boolean;
  prompt: string;
  error?: boolean;
}

interface GeneratedSculptureGridProps {
  images: GeneratedImage[];
  onSelect: (id: string) => void;
  selectedIds: Set<string>;
}

export function GeneratedSculptureGrid({
  images,
  onSelect,
  selectedIds,
}: GeneratedSculptureGridProps) {
  console.log("GeneratedSculptureGrid rendering with images:", images);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => {
        console.log("Rendering image:", image);
        const isSelected = selectedIds.has(image.id);
        
        return (
          <div
            key={image.id}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border border-border",
              isSelected && "ring-2 ring-primary",
              !image.isGenerating && !image.error && image.url && "cursor-pointer hover:opacity-90"
            )}
            onClick={() => {
              if (!image.isGenerating && !image.error && image.url) {
                onSelect(image.id);
              }
            }}
          >
            {image.isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : image.error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 p-4">
                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Failed to generate image. Please try again.
                </p>
              </div>
            ) : image.url ? (
              <img
                src={image.url}
                alt={`Generated sculpture based on prompt: ${image.prompt}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <p className="text-sm text-muted-foreground">No image available</p>
              </div>
            )}
            
            {isSelected && !image.isGenerating && !image.error && image.url && (
              <div className="absolute top-2 right-2">
                <div className="h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
