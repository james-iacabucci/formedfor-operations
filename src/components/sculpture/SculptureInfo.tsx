import { format } from "date-fns";
import { LinkIcon, FolderIcon } from "lucide-react";
import { Sculpture } from "@/types/sculpture";

interface SculptureInfoProps {
  sculpture: Sculpture;
  folders: Array<{ id: string; name: string }>;
  showAIContent?: boolean;
}

export function SculptureInfo({ sculpture, folders, showAIContent }: SculptureInfoProps) {
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
      
      {showAIContent && sculpture.ai_generated_name ? (
        <>
          <h3 className="mt-2 font-semibold">{sculpture.ai_generated_name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{sculpture.ai_description}</p>
        </>
      ) : (
        <p className="mt-1 font-medium line-clamp-2">{sculpture.prompt}</p>
      )}

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