import { format } from "date-fns";
import { ImageIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sculpture } from "@/types/sculpture";

interface SculptureCardProps {
  sculpture: Sculpture;
  onPreview: (sculpture: Sculpture) => void;
  onDelete: (sculpture: Sculpture) => void;
}

export function SculptureCard({ sculpture, onPreview, onDelete }: SculptureCardProps) {
  return (
    <Card
      className={`group relative ${sculpture.image_url ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (
          sculpture.image_url &&
          !(e.target as HTMLElement).closest("button")
        ) {
          onPreview(sculpture);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
          {sculpture.image_url ? (
            <>
              <img
                src={sculpture.image_url}
                alt={sculpture.prompt}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sculpture);
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Delete sculpture"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span>Generating...</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            {format(new Date(sculpture.created_at), "MMM d, yyyy")}
          </p>
          <p className="mt-1 font-medium line-clamp-2">{sculpture.prompt}</p>
        </div>
      </CardContent>
    </Card>
  );
}