
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagsListProps {
  title: string;
  tags: Tag[];
  variant?: "default" | "secondary" | "outline";
  onTagClick: (tagId: string) => void;
  showRemoveIcon?: boolean;
  activeTagId?: string | null;
}

export function TagsList({ 
  title, 
  tags, 
  variant = "default",
  onTagClick,
  showRemoveIcon = false,
  activeTagId
}: TagsListProps) {
  return (
    <div className="space-y-2">
      {title && <div className="text-sm font-medium">{title}</div>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={tag.id === activeTagId ? "default" : variant}
            className={cn(
              "cursor-pointer",
              tag.id === 'all' && !activeTagId && "bg-primary"
            )}
            onClick={() => onTagClick(tag.id)}
          >
            {tag.name}
            {showRemoveIcon && <X className="ml-1 h-3 w-3" />}
          </Badge>
        ))}
      </div>
    </div>
  );
}
