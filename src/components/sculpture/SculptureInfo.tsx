import { format } from "date-fns";
import { LinkIcon, FolderIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";

interface SculptureInfoProps {
  sculpture: Sculpture;
  folders: Array<{ id: string; name: string }>;
}

export function SculptureInfo({ sculpture, folders }: SculptureInfoProps) {
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
      {folders.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {folders.map(folder => (
            <div
              key={folder.id}
              className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md"
            >
              <FolderIcon className="w-3 h-3" />
              <span>{folder.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}