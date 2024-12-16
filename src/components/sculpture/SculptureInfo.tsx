import { format } from "date-fns";
import { LinkIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";

interface SculptureInfoProps {
  sculpture: Sculpture;
}

export function SculptureInfo({ sculpture }: SculptureInfoProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {format(new Date(sculpture.created_at), "MMM d, yyyy")}
        </p>
        {sculpture.original_sculpture_id && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <LinkIcon className="w-4 h-4" />
            <span>Variation ({sculpture.creativity_level})</span>
          </div>
        )}
      </div>
      <p className="mt-1 font-medium line-clamp-2">{sculpture.prompt}</p>
    </div>
  );
}