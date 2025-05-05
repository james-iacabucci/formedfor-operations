
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagsListProps {
  title?: string;
  tags: Tag[];
  variant?: "default" | "secondary" | "outline";
  onTagClick?: (tagId: string) => void;
  showRemoveIcon?: boolean;
  activeTagId?: string | null;
  readOnly?: boolean;
}

export function TagsList({ 
  title = "", 
  tags, 
  variant = "default",
  onTagClick,
  showRemoveIcon = false,
  activeTagId,
  readOnly = true
}: TagsListProps) {
  return (
    <div className="space-y-2">
      {title && <div className="text-sm font-medium">{title}</div>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className={cn(
              "bg-muted text-white border-0",
              !readOnly && "cursor-pointer"
            )}
            onClick={() => !readOnly && onTagClick?.(tag.id)}
          >
            {tag.name}
            {showRemoveIcon && <X className="ml-1 h-3 w-3" />}
          </Badge>
        ))}
      </div>
    </div>
  );
}
